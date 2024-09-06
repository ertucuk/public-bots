const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Staff, User } = require('../../../../Global/Settings/Schemas')
const Staffs = require('../../../../Global/Base/Staff')

module.exports = {
    Name: 'taglı',
    Aliases: ['tagaldır', 'tagli'],
    Description: 'Taglı almanızı sağlar.',
    Usage: 'taglı <@User/ID>',
    Category: 'Auth',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.guild.settings.public) {
            message.reply({ content: `${client.getEmoji('mark')} Bu sistem kapalı durumda.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.guild.settings.staffs.some((r) => message.member.roles.cache.has(r)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.bot).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const document = await User.findOne({ userID: member.id });
        if (!document) {
            message.reply({ content: `${client.getEmoji('mark')} Veritabanında kayıt bulunamadı.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!member.user.displayName.includes(message.guild.settings.serverTag)) {
            message.channel.send({ content: `${client.getEmoji('mark')} Belirttiğin kullanıcı sunucunun tagını almadığı için yetkiye alamazsın.` })
            return;
        }

        if (document && document.Tagged) {
            message.reply({ content: `${client.getEmoji('mark')} Bu üye zaten taglı olarak belirlenmiş.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
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
            content: `${member}`,
            embeds: [
                new EmbedBuilder({
                    color: client.random(),
                    description: `${message.member} adlı yetkili seni taglı olarak belirlemek istiyor. Kabul ediyor musun?`,
                })
            ],
            components: [row]
        });

        const filter = (b) => b.user.id === member.id;
        const collector = question.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (button) => {
            button.deferUpdate();
            if (button.customId === 'accept') {
                question.edit({
                    content: `${client.getEmoji('check')} ${member} adlı üye taglı olarak belirlendi.`,
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

                await User.updateOne({ userID: member.id }, { $set: { Tagged: true } }, { upsert: true });

                const now = Date.now()
                const document = await Staff.findOne({ id: message.author.id });

                await User.updateOne(
                    { userID: message.author.id },
                    { $push: { Taggeds: { id: member.id, timestamp: now } } },
                    { upsert: true }
                )

                if (message.guild.settings?.maxStaffs.some((r) => message.member.roles.cache.has(r))) {
                    if (!document?.tasks.some((task) => task.type === 'TAG')) return;
                    await Staffs.checkTasks({
                        document,
                        spesificType: 'TAG',
                        count: 1
                    })
                    await Staffs.checkRole(message.member, document, 'rank')
                } else {
                    await Staffs.addPoint(message.member, 'tag')
                    await Staffs.checkRole(message.member, document, 'point')
                }
            } else if (button.customId === 'deaccept') {
                question.edit({
                    embeds: null,
                    content: `${client.getEmoji('check')} ${member} adlı üye taglı isteğini reddetti.`,
                    components: []
                })
            }
        });
    },
};