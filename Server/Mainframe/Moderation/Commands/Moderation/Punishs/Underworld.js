const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const getLimitMute = new Map()
const { Punitive, User, Jail, Mute, VoiceMute } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'ban',
    Aliases: ['underworld', 'sg', 'ertuyarramıyesin'],
    Description: 'Belirlenen üyeyi underworlda atar.',
    Usage: 'ban <@User/ID>',
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

        if (!message.guild.settings.banAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
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
            message.reply(global.cevaplar.dokunulmaz).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (message.member.roles.highest.position <= member.roles.highest.position) {
            message.reply(global.cevaplar.yetkiust).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (member.roles.cache.has(message.guild.settings.underworldRole)) {
            message.reply(global.cevaplar.cezavar).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (getLimitMute.get(message.author.id) >= message.guild.settings.banLimit) {
            message.reply(global.cevaplar.limit).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const reason = args.splice(1).join(" ") || "Sebep Belirtilmedi."
        if (!reason) {
            message.reply(global.cevaplar.sebep).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (Number(message.guild.settings.banLimit)) {
            if (!message.member.permissions.has(Flags.Administrator) && !message.guild.settings.ownerRoles.some(ertumharikasinbe => message.member.roles.cache.has(ertumharikasinbe))) {
                getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) + 1)
                setTimeout(() => {
                    getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) - 1)
                }, 1000 * 60 * 5)
            }
        }

        if (member) {
            const chatMute = await Mute.findOne({ ID: member.id });
            const voiceMute = await VoiceMute.findOne({ ID: member.id });
            const jail = await Jail.findOne({ ID: member.id });

            if (chatMute) await Mute.deleteOne({ ID: member.id });
            if (voiceMute) await VoiceMute.deleteOne({ ID: member.id });
            if (jail) await Jail.deleteOne({ ID: member.id });

            member.Punitive(message.member, "Underworld", reason, message.channel);
            await Punitive.updateMany({ Member: member.id, Active: true }, { $set: { Active: false, Remover: message.author.id, Expried: Date.now() } });
            message.react(`${client.getEmoji("check")}`)
        }
    },
};