const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'sorunçözmepanel',
    Aliases: [],
    Description: 'Sorun Çözücü Çağırır',
    Usage: 'sorunçözmepanel',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('solver')
                    .setLabel('Sorun Çözücü Çağır')
                    .setStyle(ButtonStyle.Secondary),
        )

        message.channel.send({
            content: `Alttaki butona tıklayarak sorun çözücü çağırabilirsiniz.`,
            components: [row]
        });
    },
};