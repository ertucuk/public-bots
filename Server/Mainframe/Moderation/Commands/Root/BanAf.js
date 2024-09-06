const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'); 

module.exports = {
    Name: 'banaf',
    Aliases: ['banaffı', 'banaf'],
    Description: 'Sunucudaki tüm banları kaldırırsınız.',
    Usage: 'banaf',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const bans = await message.guild.bans.fetch();
        bans.forEach(async (banInfo) => {
            const user = banInfo.user;
            await message.guild.bans.remove(user);
        });

        await message.reply({ content: `Sunucudaki tüm yasaklar kaldırıldı.` });
  }, 
};