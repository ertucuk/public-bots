const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    Name: 'link',
    Aliases: ['url'],
    Description: 'Url kullanımını gösterir.',
    Usage: 'link',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000))
            return;
        } 

        if (!message.guild.vanityURLCode) {
            message.reply({ content: `${client.getEmoji('mark')} Sunucuda özel url bulunmuyor.` });
            return;
        }

        const link = await message.guild.fetchVanityData();
        message.reply({ content: `https://discord.gg/${message.guild.vanityURLCode} (**${link.uses} kez kullanıldı.**)` })
    },
};