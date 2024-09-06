const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'otokayıtpanel',
    Aliases: [],
    Description: 'Oto Kayıt Panel',
    Usage: 'otokayıtpanel',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('register')
                    .setLabel('Kayıt Ol')
                    .setStyle(ButtonStyle.Success)
            )

        message.channel.send({
            content: `
Merhaba! Oto Kayıt Sistemine Hoş Geldiniz!

Bu alanda sizin geçmiş verilerinizi kontrol ederek sizi doğru şekilde ve güvenli şekilde teyit gereksinimi duymadan kayıt etmektedir.
Bu işlem sonrası eğer ki sorun yaşıyorsanız veya yanlış kayıt olduğunuzu düşünüyorsanız kayıt yetkilileri ile iletişime geçebilirsiniz.

Şimdiden iyi eğlenceler dilerim!`, components: [row]
        });
    },
};