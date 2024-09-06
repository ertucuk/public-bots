const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Punitive, User, Jail } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'uyarıtemizle',
    Aliases: ['uyarıkaldır', 'uyarıkaldırma'],
    Description: 'Belirlenen üyeyin ceza geçmişini temizler.',
    Usage: 'siciltemizle <@User/ID>',
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

        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 

        const data = await Punitive.find({ Member: member.id, Type: 'Uyarılma' });
        if (!data.length) {
            message.reply({ content: 'Belirtilen üyenin herhangi bir uyarı verisi bulunamadı.' }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        await Punitive.deleteMany({ Member: member.id, Type: 'Uyarılma' });
        message.reply({ content: 'Üyenin uyarı geçmişi başarıyla temizlendi.' }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
    },
};