const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, roleMention } = require('discord.js');

module.exports = {
    Name: 'streamerpanel',
    Aliases: [],
    Description: 'Streamer Oda',
    Usage: 'streamerpanel',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('streamerpanel')
                    .setLabel('Streamer Başvurusu Gönder')
                    .setStyle(ButtonStyle.Secondary),
            )

        message.channel.send({
            content: `
__**${message.guild.name} Streamer Başvuru**__

Selam **${message.guild.name}** Sunucumuzun değerli üyeleri, sizlerde **${message.guild.name}** sunucumuzda streamer olmak istiyorsanız aşağıdaki adımları takip edebilirsiniz.

İlk olarak [Speedtest](https://www.speedtest.net) \`(https://www.speedtest.net)\` isimli siteye gidip bir hız testi yapın.

Hız testiniz bittikten sonra **Streamer Başvurusu Gönder** butonuna tıklayın.

Açılan forma hız testi linkinizi yapıştırın ve **Gönder** butonuna tıklayın.

Başvurunuz alındıktan sonra gereken şartları sağlamanız durumunda otomatik olarak ${roleMention(message.guild.settings.streamerRole)} rolü verilecektir.`, components: [row]
        });
    },
};