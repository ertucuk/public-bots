const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'); 

module.exports = {
    Name: 'yaz',
    Aliases: ['write'],
    Description: 'Komudu kullandığınız kanala mesaj gönderir.',
    Usage: 'yaz',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!args[0]) return;
        message.delete();
        message.channel.send({ content: args.join(' ')});
    }, 
};