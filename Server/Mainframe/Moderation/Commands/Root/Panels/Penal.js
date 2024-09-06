const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 

module.exports = {
    Name: 'cezapanel',
    Aliases: ['cezapanel', 'ceza-panel'],
    Description: 'Ceza paneli gösterir.',
    Usage: 'cezapanel',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cezaPanel-I')
                .setLabel(' \u200B \u200B Aldığın Cezalar \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('cezaPanel-II')
                .setLabel(' \u200B \u200B Ceza Bitiş Süren \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('cezaPanel-III')
                .setLabel(' \u200B \u200B Şüpheliden Çık! \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary)
        )

        if (message) message.delete().catch(() => {});
        message.channel.send({ content: `**Merhaba ${message.guild.name} sunucusunun ceza paneline hoş geldiniz!**\n\nAşağıdaki düğmelerden cezalarınız hakkında detaylı bilgi alabilirsiniz. Şüpheli durumdan çıkmak için **Şüpheliden Çık!** düğmesine basabilirsiniz.`, components: [row] });

    }, 
};