const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Punitive, User, ForceBan, Mute, VoiceMute, Jail, Ads } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'unecezalı',
    Aliases: ['unecezali', 'uneceza'],
    Description: 'Belirlenen üyeyi cezalıdan çıkarır.',
    Usage: 'unecezalı <@User/ID>',
    Category: 'Moderation',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

        if (!message.guild.settings.etAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
        if (!member.manageable) return message.reply(global.cevaplar.dokunulmaz).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply(global.cevaplar.yetkiust).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })

        const document = await Punitive.findOne({ Member: member.id, Type: "Etkinlik Ceza", Active: true });
        if (!document) return message.reply(global.cevaplar.cezayok).then(s => setTimeout(() => s.delete().catch(err => { }), 7500));

        message.react(`${client.getEmoji("check")}`)
        member.roles.remove(message.guild.settings.etRole).catch(err => { });
        message.reply({ content: `${client.getEmoji("check")} ${member} üyesinin etkinlik cezası ${message.author} tarafından kaldırıldı!` }).then((e) => setTimeout(() => { e.delete(); }, 50000));
        await Punitive.updateOne({ No: document.No }, { $set: { Active: false, Expried: Date.now(), Remover: message.member.id } }, { upsert: true })
    },
};