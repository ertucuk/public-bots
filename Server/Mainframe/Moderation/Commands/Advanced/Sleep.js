const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    Name: 'sleep',
    Aliases: ['sleep'],
    Description: 'Belirttiğin kullanıcı sleep odasına atar.',
    Usage: 'sleep <@User/ID>',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.transporterRoles.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            message.reply({ content: "Bir üye belirtmelisin." }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (!member.voice.channel) {
            message.reply({ content: "Belirttiğiniz üye bir ses kanalında değil." }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 

        const channel = message.guild.channels.cache.get(message.guild.settings.afkChannel);
        if (!channel) return;

        member.voice.setChannel(channel.id);
        message.react(client.getEmoji('check'));
        message.reply({ content: `${member} kullanıcısı başarıyla sleep odasına atıldı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
    }
};