const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'); 

module.exports = {
    Name: 'restart',
    Aliases: ['res', 'r'],
    Description: 'yeniden başlatır',
    Usage: 'restart',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
         
        await message.delete()
        process.exit(0);
    }, 
};