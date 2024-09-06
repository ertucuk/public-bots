const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Punitive, ForceBan } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'unforceban',
    Aliases: ['açılmazbanaç', 'açılmaz-banaç', 'açılmazban-aç', 'açılmaz-ban-aç', 'unforce-ban'],
    Description: 'Banını kaldıralamaz olarak işaretlediğiniz kullanıcının işaretini kaldırırsınız.',
    Usage: 'unforceban <@User/ID>',
    Category: 'Moderation',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await client.getUser(args[0])
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })

        await message.guild.members.unban(member.id).catch(err => { });
        const res = await Punitive.findOne({ Member: member.id, Type: "Kalkmaz Yasaklama", Active: true })
        await Punitive.updateOne({ No: res.No }, { $set: { "Active": false, Expried: Date.now(), Remover: message.member.id } }, { upsert: true })
        await ForceBan.deleteOne({ ID: member.id })

        message.react(`${client.getEmoji("check")}`)
        message.channel.send({ content: `${client.getEmoji("check")} ${member} adlı kullanıcının banı kaldırıldı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
    }
};