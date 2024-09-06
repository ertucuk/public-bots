const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 

module.exports = {
    Name: 'secretroom',
    Aliases: ['özeloda', 'ozeloda'],
    Description: 'Özel Oda',
    Usage: 'secretroom',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('secretroom')
                    .setLabel('Özel Oda Oluştur')
                    .setStyle(ButtonStyle.Secondary)
            )

        message.channel.send({
            content: `
Merhaba! Özel Oda Sistemine Hoş Geldiniz!

Bu alanda kendi adınıza özel bir oda oluşturabilir ve bu odada istediğiniz konuları tartışabilirsiniz. Yalnızca davet ettiğiniz kişilerin katılmasını sağlayarak özel bir ortam yaratabilir veya herkese açık hale getirerek geniş bir katılımcı kitlesiyle iletişim kurabilirsiniz.

Gizliliği ön planda tutmak istiyorsanız, odanızı kitleyebilir ve sadece belirlediğiniz kişilere erişim izni verebilirsiniz. Alternatif olarak, herkesin rahatlıkla katılabilmesi için odanızı herkese açık yapabilir ve geniş bir kitleyle etkileşime geçebilirsiniz.

Aşağıdaki **"Özel Oda Oluştur"** düğmesine tıklayarak kendi odanızı anında oluşturabilirsiniz. İyi sohbetler dileriz!

Not: [\` Sesli kanalın sohbet kısmından kanalına özel ayarlar paneline erişebilirsin. \`]
    `, components: [row]
        });
 
    }, 
};