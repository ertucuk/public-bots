const { ActionRowBuilder, ComponentType, EmbedBuilder, inlineCode, roleMention, time, bold, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js')
const { Staff, Points, Tasks } = require('../../../../../Global/Settings/Schemas')
const Staffs = require('../../../../../Global/Base/Staff')
const ms = require('ms')

module.exports = async function isStaff(client, message, member) {
    if (member.roles.highest.position >= message.member.roles.highest.position) {
        message.channel.send({ content: `${client.getEmoji('mark')} Sahip olduğun yetkinin altındaki rollerde işlem yapabilirsin.` })
        return
    }

    const memberDocument = (await Staff.findOne({ id: member.id })) || { oldRoles: [] }
    const { currentRole } = member.guild.settings.maxStaffs.some((r) => member.roles.cache.has(r)) ? await Staffs.getRank(member.roles.cache.map((r) => r.id)) : await Staffs.getPointRank(member.roles.cache.map((r) => r.id))

    const row = new ActionRowBuilder({
        components: [
            new StringSelectMenuBuilder({
                custom_id: 'role-selection3',
                placeholder: 'Üst Yetkili Rolleri',
                options: message.guild.settings.maxStaffs.map((r) => ({
                    value: r,
                    label: message.guild.roles.cache.get(r).name
                }))
            })
        ]
    });

    const row2 = new ActionRowBuilder({
        components: [
            new StringSelectMenuBuilder({
                custom_id: 'role-selection',
                placeholder: 'Orta Rolleri',
                options: message.guild.settings.mediumStaffs.map((r) => ({
                    value: r,
                    label: message.guild.roles.cache.get(r).name
                }))
            })
        ]
    });

    const row3 = new ActionRowBuilder({
        components: [
            new StringSelectMenuBuilder({
                custom_id: 'role-selection2',
                placeholder: 'Başlangıç Rolleri',
                options: message.guild.settings.minStaffs.map((r) => ({
                    value: r,
                    label: message.guild.roles.cache.get(r).name
                }))
            })
        ]
    });

    const question = await message.channel.send({
        components: message.member.permissions.has(PermissionFlagsBits.Administrator) ? [row, row2, row3] : message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) ? [row, row2, row3] : message.member.roles.cache.has(message.guild.settings.authLeader) ? [row, row2, row3] : message.member.roles.cache.has(message.guild.settings.authController) ? [row2, row3] : [row3],
        embeds: memberDocument.oldRoles.length ? [
            new EmbedBuilder({
                color: client.random(),
                description: [
                    `${member} adlı yetkiliye yapacağınız işlemi seçin!\n`,
                    `${bold('GEÇMİŞ YETKİLERİ')}`,
                    memberDocument.oldRoles.map((r) => `${time(Math.floor(r.timestamp / 1000), 'R')} ${r.roles.length ? r.roles.map((rr) => roleMention(rr)).join(', ') : 'Yetkiden atılma!'}`).join('\n')
                ].join('\n')
            })
        ] : []
    })

    const filter = (i) => i.user.id === message.author.id && question.id === i.message.id
    const collector = question.createMessageComponentCollector({
        filter,
        time: 1000 * 60 * 5,
        componentType: ComponentType.StringSelect
    })

    collector.on('collect', async (i) => {
        if (i.customId === 'role-selection3') {
            const taskDocument = await Tasks.find({})
            const newRole = taskDocument.find((r) => r.ROLE === i.values[0])
            if (currentRole.ROLE === newRole.ROLE) {
                i.reply({
                    content: 'Belirttiğin rolde bulunuyor.',
                    ephemeral: true
                })
                return
            }

            i.deferUpdate()
            question.edit({
                content: null,
                components: [],
                embeds: [
                    new EmbedBuilder({
                        color: client.random(),
                        description: `${member} adlı kullanıcının yetkisi ${roleMention(currentRole.ROLE)} yetkisinden ${roleMention(newRole.ROLE)} yetkisine geçirildi.`
                    })
                ]
            })

            const document = await Staff.findOneAndUpdate(
                { id: member.id },
                { $push: { oldRoles: { roles: [newRole.ROLE, newRole.EXTRA_ROLE], timestamp: Date.now() } }, $set: { tasks: [] } },
                { upsert: true }
            )

            document.roleStarted = Date.now();
            document.invitedUsers = [];
            document.tasks = [];
            document.staffTakes = [];
            document.task = '';
            document.totalPoints = 0;
            document.registerPoints = 0;
            document.invitePoints = 0;
            document.otherPoints = 0;
            document.messagePoints = 0;
            document.responsibilityPoints = 0;
            document.staffPoints = 0;
            document.publicPoints = 0;
            document.bonusPoints = 0;
            document.markModified('oldRoles roleStarted invitedUsers tasks staffTakes task totalPoints registerPoints invitePoints otherPoints messagePoints responsibilityPoints staffPoints publicPoints bonusPoints')
            await document.save()

            await member.roles.add(newRole.ROLE);
            await member.roles.remove(currentRole.ROLE);

            if (currentRole.EXTRA_ROLE !== newRole.EXTRA_ROLE) {
                if (Array.isArray(currentRole.EXTRA_ROLE)) {
                    for (const roleId of currentRole.EXTRA_ROLE) {
                        await member.roles.remove(roleId);
                    }
                } else {
                    await member.roles.remove(currentRole.EXTRA_ROLE);
                }

                if (Array.isArray(newRole.EXTRA_ROLE)) {
                    for (const roleId of newRole.EXTRA_ROLE) {
                        await member.roles.add(roleId);
                    }
                } else {
                    await member.roles.add(newRole.EXTRA_ROLE);
                }
            }

            const logChannel = await client.getChannel('staff-log', message)
            if (logChannel) {
                logChannel.send({
                    content: `${message.author}(${inlineCode(message.author.id)}) adlı yetkili ${member} (${inlineCode(member.id)}) adlı yetkiliyi ${roleMention(currentRole.ROLE)} yetkisini ${roleMention(i.values[0])} yetkisine geçirdi.`
                })
            }
        } else {
            const pointDocument = await Points.find({})
            const newRole = pointDocument.find((r) => r.ROLE === i.values[0])
            if (currentRole.ROLE === newRole.ROLE) {
                i.reply({
                    content: 'Belirttiğin rolde bulunuyor.',
                    ephemeral: true
                })
                return
            }

            i.deferUpdate()
            question.edit({
                content: null,
                components: [],
                embeds: [
                    new EmbedBuilder({
                        color: client.random(),
                        description: `${member} adlı kullanıcının yetkisi ${roleMention(currentRole.ROLE)} yetkisinden ${roleMention(newRole.ROLE)} yetkisine geçirildi.`
                    })
                ]
            })

            const document = await Staff.findOneAndUpdate(
                { id: member.id },
                { $push: { oldRoles: { roles: [newRole.ROLE, newRole.EXTRA_ROLE], timestamp: Date.now() } }, $set: { tasks: [] } },
                { upsert: true }
            )

            document.roleStarted = Date.now();
            document.invitedUsers = [];
            document.tasks = [];
            document.task = '';
            document.totalPoints = 0;
            document.registerPoints = 0;
            document.invitePoints = 0;
            document.otherPoints = 0;
            document.messagePoints = 0;
            document.responsibilityPoints = 0;
            document.staffPoints = 0;
            document.tagPoints = 0;
            document.publicPoints = 0;
            document.bonusPoints = 0;
            document.markModified('oldRoles roleStarted invitedUsers tasks staffTakes task totalPoints registerPoints invitePoints otherPoints messagePoints responsibilityPoints staffPoints tagPoints publicPoints bonusPoints')
            await document.save()

            await member.roles.add(newRole.ROLE);
            await member.roles.remove(currentRole.ROLE);

            if (currentRole.EXTRA_ROLE !== newRole.EXTRA_ROLE) {
                if (Array.isArray(currentRole.EXTRA_ROLE)) {
                    for (const roleId of currentRole.EXTRA_ROLE) {
                        await member.roles.remove(roleId);
                    }
                } else {
                    await member.roles.remove(currentRole.EXTRA_ROLE);
                }

                if (Array.isArray(newRole.EXTRA_ROLE)) {
                    for (const roleId of newRole.EXTRA_ROLE) {
                        await member.roles.add(roleId);
                    }
                } else {
                    await member.roles.add(newRole.EXTRA_ROLE);
                }
            }

            const logChannel = await client.getChannel('staff-log', message)
            if (logChannel) {
                logChannel.send({
                    content: `${message.author}(${inlineCode(message.author.id)}) adlı yetkili ${member} (${inlineCode(member.id)}) adlı yetkiliyi ${roleMention(currentRole.ROLE)} yetkisini ${roleMention(i.values[0])} yetkisine geçirdi.`
                })
            } 
        }
    })

    collector.on('end', (_, reason) => {
        if (reason === 'time') question.delete().catch(() => { })
    })
}