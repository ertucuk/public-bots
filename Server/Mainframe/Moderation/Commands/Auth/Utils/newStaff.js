const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, inlineCode, roleMention, bold, time, PermissionFlagsBits } = require('discord.js')
const { Staff, Points, User } = require('../../../../../Global/Settings/Schemas')
const Staffs = require('../../../../../Global/Base/Staff')
const ms = require('ms')

module.exports = async function newStaff(client, message, member) {
    const memberDocument = (await Staff.findOne({ id: member.id })) || new Staff({ id: member.id })

    if (memberDocument?.isOldAuth === true) {
        message.channel.send({ content: `${client.getEmoji('mark')} Belirttiğin kullanıcı önceden yetkiliymiş. Bu yüzden işleme devam edemiyorum.` })
        return
    }

    if (message.guild.settings.public) {
        if (!member.user.displayName.includes(message.guild.settings.serverTag)) {
            message.channel.send({ content: `${client.getEmoji('mark')} Belirttiğin kullanıcı sunucunun tagını almadığı için yetkiye alamazsın.` })
            return
        }
    }

    const row = new ActionRowBuilder({
        components: [
            new ButtonBuilder({
                custom_id: 'accept',
                label: 'Kabul Ediyorum',
                style: ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                custom_id: 'deaccept',
                label: 'Reddediyorum',
                style: ButtonStyle.Secondary
            })
        ]
    })
    const question = await message.channel.send({
        content: `${member}, ${message.author} adlı yetkilimiz seni yetkiye davet etti!`,
        components: [row],
        embeds: memberDocument.oldRoles.length
            ? [
                new EmbedBuilder({
                    color: client.random(),
                    description: [
                        `${member} şuan da sana yetki verilmek üzere\n`,
                        `${bold('GEÇMİŞ YETKİ DURUMU')}`,
                        memberDocument.oldRoles
                            .map(
                                (r) =>
                                    `${time(Math.floor(r.timestamp / 1000), 'R')} ${r.roles.length ? r.roles.map((rr) => roleMention(rr)).join(', ') : 'Yetkiden atılma!'
                                    }`
                            )
                            .join('\n')
                    ].join('\n')
                })
            ]
            : []
    })

    const filter = (i) => i.user.id === member.id && ['accept', 'deaccept'].includes(i.customId)
    const collector = question.createMessageComponentCollector({
        filter,
        time: 1000 * 60 * 5,
        componentType: ComponentType.Button
    })

    collector.on('collect', async (i) => {
        i.deferUpdate()

        if (i.customId === 'deaccept') {
            question.edit({
                content: `${member} adlı kullanıcı ${message.author} adlı yetkilinin yetkiye alma isteğini redetti.`,
                components: []
            })
            return
        }

        question.edit({
            content: `Başarılı bir şekilde ${member} adlı üye yetkili olarak seçildi.`,
            components: [
                new ActionRowBuilder({
                    components: [
                        new ButtonBuilder({
                            custom_id: 'accept',
                            label: 'İstek Kabul Edildi!',
                            disabled: true,
                            style: ButtonStyle.Secondary
                        })
                    ]
                })
            ]
        })

        const now = Date.now()
        const document = await Staff.findOneAndUpdate(
            { id: message.author.id },
            { $push: { staffTakes: { id: member.id, timestamp: now } } },
            { upsert: true }
        )

        await User.updateOne(
            { userID: message.author.id },
            { $push: { Auths: { id: member.id, timestamp: now } } },
            { upsert: true }
        )

        const pointDocument = await Points.find({})

        const sortedRanks = pointDocument.sort((a, b) => a.POINT - b.POINT)
        await member.roles.add(sortedRanks[0].EXTRA_ROLE.map((r) => r))
        await member.roles.add(sortedRanks[0].ROLE)

        await Staff.updateOne(
            { id: member.id },
            { $set: { roleStarted: now }, $push: { oldRoles: { roles: [sortedRanks[0].ROLE, sortedRanks[0].EXTRA_ROLE], timestamp: Date.now() } } },
            { upsert: true }
        )

        const takeLogChannel = await client.getChannel('staff-log', message)
        if (takeLogChannel) {
            takeLogChannel.send({
                content: `${message.author} (${inlineCode(message.author.id)}) adlı yetkili ${member} (${inlineCode(member.id)}) adlı kullanıcıyı ${roleMention(sortedRanks[0].ROLE)} yetkisinden yetkiye başlattı.`
            })
        }

        if (message.guild.settings?.maxStaffs.some((r) => message.member.roles.cache.has(r))) {
            if (!document?.tasks.some((task) => task.type === 'STAFF')) return;
            await Staffs.checkTasks({
                document,
                spesificType: 'STAFF',
                count: 1
            })
            await Staffs.checkRole(message.member, document, 'rank')
        } else {
            await Staffs.addPoint(message.member, 'staff')
            await Staffs.checkRole(message.member, document, 'point')
        }

        await document.save()
    })

    collector.on('end', (_, reason) => {
        if (reason === 'time') question.delete().catch(() => { })
    })
}