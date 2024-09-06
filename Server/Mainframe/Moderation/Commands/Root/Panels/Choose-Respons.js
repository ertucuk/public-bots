const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'sorumlulukseç',
    Aliases: ['sorumlulukseç'],
    Description: 'Sorumluluk paneli gösterir.',
    Usage: 'sorumlulukseç',
    Category: 'Root',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('chat')
                .setLabel('Chat Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('return')
                .setLabel('Return Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('oryantasyon')
                .setLabel('Oryantasyon Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('soruncozme')
                .setLabel('Sorun Çözücü')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('rol')
                .setLabel('Rol Denetim Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('etkinlik')
                .setLabel('Etkinlik Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('yetkili')
                .setLabel('Yetkili Alım Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('public')
                .setLabel('Public Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ban')
                .setLabel('Ban & Ceza Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('streamer')
                .setLabel('Stramer Sorumlusu')
                .setStyle(ButtonStyle.Secondary),
        );

        if (message) message.delete().catch(() => { });
        message.channel.send({
            content: `Alttaki butona tıklayarak istediğiniz sorumlulukları alabilirsiniz. Unutmayın! En fazla **3** tane sorumluluk alabilirsiniz.`,
            components: [row, row2]
        });
    }
};