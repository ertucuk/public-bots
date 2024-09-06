const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, Collection, bold } = require('discord.js');

module.exports = {
    Name: 'tag',
    Aliases: [],
    Description: 'Tagı gösterir.',
    Usage: 'tag',
    Category: 'Global',
    Cooldown: 15,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.public) return;

        const tag = message.guild.settings.serverTag || 'Tag ayarlanmamış.';
        message.channel.send({ content: `${tag}` });
    }
};