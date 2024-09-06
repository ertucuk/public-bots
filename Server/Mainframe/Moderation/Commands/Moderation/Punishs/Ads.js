const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const getLimitMute = new Map()
const { Punitive, Mute, VoiceMute, Jail } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'reklam',
    Aliases: ['ads'],
    Description: 'Belirlenen üyeyi reklam nedeniyle cezalıya atar.',
    Usage: 'reklam <@User/ID>',
    Category: 'Moderation',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.guild.settings.jailAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (message.author.id === member.id) {
            message.reply(global.cevaplar.kendi).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (!member.manageable) {
            message.reply(global.cevaplar.yetersizyetkim).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (message.member.roles.highest.position <= member.roles.highest.position) {
            message.reply(global.cevaplar.yetkiust).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (member.roles.cache.has(message.guild.settings.adsRole)) {
            message.reply(global.cevaplar.zaten).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 

        if (getLimitMute.get(message.author.id) >= message.guild.settings.jailLimit) {
            message.reply(global.cevaplar.limit).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        message.reply({ embeds: [new EmbedBuilder({ description: `Kanıt için ekran görüntüsü atınız. İşlem 2 dakika sonra iptal edilecektir.` })] }).then(() => {
            message.channel.awaitMessages({ filter: (m) => m.member.id === message.author.id, max: 1, time: 120000 }).then(async m => {
                if (!m.first().attachments?.first()) {
                    message.reply({ embeds: [new EmbedBuilder({ description: `Ekran görüntüsü atmadığınız için işlem iptal edildi.` })] }).then(s => setTimeout(() => s.delete().catch(err => { }), 7500));
                    return;
                }

                const attachment = m.first().attachments.first().url
                const data = new AttachmentBuilder(attachment, { name: 'ads.png' })

                if (member) {
                    const chatMute = await Mute.findOne({ ID: member.id });
                    const voiceMute = await VoiceMute.findOne({ ID: member.id });
                    const jail = await Jail.findOne({ ID: member.id });

                    if (chatMute) await Mute.deleteOne({ ID: member.id });
                    if (voiceMute) await VoiceMute.deleteOne({ ID: member.id });
                    if (jail) await Jail.deleteOne({ ID: member.id });

                    member.Punitive(message.member, 'ADS', 'Reklam Yaptı!', message.channel, null, null, data.attachment)
                    await Punitive.updateMany({ Member: member.id, Active: true }, { $set: { Active: false, Remover: message.author.id, Expried: Date.now() } });
                    message.react(`${client.getEmoji("check")}`)
                }
            })
        })
    },
};