const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const getLimitMute = new Map()
const { Punitive, User } = require('../../../../../Global/Settings/Schemas');
const ms = require('ms');

module.exports = {
    Name: 'ecezalı',
    Aliases: ['ecezali'],
    Description: 'Belirlenen üyeye etkinlik yasağı uygular.',
    Usage: 'ecezalı <@User/ID>',
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

        if (!message.guild.settings.etAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
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

        if (member.roles.cache.has(message.guild.settings.etRole)) {
            message.reply(global.cevaplar.zaten).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 

        if (getLimitMute.get(message.author.id) >= message.guild.settings.etLimit) {
            message.reply(global.cevaplar.limit).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const time = args[1] ? args[1] : undefined;
        if (!time) {
            message.reply({ content: `${client.getEmoji("mark")} Geçerli bir süre belirtmelisin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const reason = args.splice(2).join(" ") || "Sebep Belirtilmedi."
        if (!reason) {
            message.reply(global.cevaplar.sebep).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }
      
        if (Number(message.guild.settings.etLimit)) {
            if (!message.member.permissions.has(Flags.Administrator) && !message.guild.settings.ownerRoles.some(e => message.member.roles.cache.has(e))) {
                getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) + 1)
                setTimeout(() => {
                    getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) - 1)
                }, 1000 * 60 * 5)
            }
        }

        if (member) {
            member.Punitive(message.member, "ET", reason, message.channel, time);
            message.react(`${client.getEmoji("check")}`)
        }
    },
};