const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js'); 

module.exports = {
    Name: 'kısayollar',
    Aliases: ['shortcuts', 'kısayol', 'kisayollar', 'kisayol'],
    Description: 'Kısayollar menüsünü atar.',
    Usage: 'kısayollar',
    Category: 'Root',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('kisayollar')
            .setPlaceholder(`${client.commands.size} adet komut bulunmakta!`)
            .addOptions([
                { label: 'Üye Komutları', description: 'Genel tüm komutları içerir.', value: 'Global' },
                { label: 'Kayıt Komutları', description: 'Genel tüm Kayıt komutlarını içerir.', value: 'Register' },
                { label: 'Yetkili Komutları', description: 'Genel tüm yetkili komutlarını içerir.', value: 'Staff' },
                { label: 'Moderasyon Komutları', description: 'Genel tüm moderasyon komutlarını içerir.', value: 'Moderation' },
                { label: 'Ekonomi Komutları', description: 'Genel tüm ekonomi komutlarını içerir.', value: 'Economy' },
                { label: 'Stat Komutları', description: 'Genel tüm stat komutlarını içerir.', value: 'Stat' },
                { label: 'Kurucu Komutları', description: 'Genel tüm kurucu komutlarını içerir.', value: 'Root' },
            ]),
        );

        if (message) message.delete().catch((err) => {});
        message.channel.send({ content: 'Merhaba! Yardım almak ister misin?\nAşağıda bulunan menüden yardım almak istediğiniz kategoriyi seçin. :tada:', components: [row] })
    }, 
};