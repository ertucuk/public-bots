const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'banner',
    Aliases: ['banner'],
    Description: 'Kullanıcının profil kapağını gösterir.',
    Usage: 'banner <@User/ID>',
    Category: 'Global',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = args.length > 0 ? message.mentions.users.first() || await client.users.fetch(args[0]) || message.author : message.author;
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 
        
        message.channel.send({
            embeds: [
                new EmbedBuilder({
                    author: { name: member.username, iconURL: member.displayAvatarURL({ dynamic: true }) },
                    color: client.random(),
                    image: { url: await member.bannerURL({ format: 'png', dynamic: true, size: 2048 }) }
                })
            ]
        });
    },
};