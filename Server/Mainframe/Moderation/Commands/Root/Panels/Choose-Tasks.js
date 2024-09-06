const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'görevseç',
    Aliases: ['görevseç'],
    Description: 'Sorumluluk paneli gösterir.',
    Usage: 'görevseç',
    Category: 'Root',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('selectPublic')
                .setLabel(' \u200B \u200B Public Görevi \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('selectStreamer')
                .setLabel(' \u200B \u200B Streamer Görevi \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('selectStaff')
                .setLabel(' \u200B \u200B Yetkili Çekme Görevi \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('selectMessage')
                .setLabel(' \u200B \u200B Mesaj Görevi \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('selectTag')
                .setLabel(' \u200B \u200B Taglı Çekme Görevi \u200B \u200B ')
                .setStyle(ButtonStyle.Secondary)
        );

        if (message) message.delete().catch(() => { });
        message.channel.send({
            embeds: [
                new EmbedBuilder({
                    title: 'Görevini Seç',
                    description: `
Merhaba Görev seçme kanalına hoş geldin.

Kendi ilgi alanına göre aşağıda ki butonlardan görev seçebilirsin. Seçtiğiniz görev o alana ağırlıklı olmak üzere diğer alanlardan da görevler içerir.

📋 __Seçebileceğiniz Görevler :__

${client.getEmoji('point')} \` Tier I (Public Görevi)          :\` Public odalarda saat kasma görevidir. Bu görevde public odalar içerisinde AFK olarak geçirdiğiniz süreler sayılmamaktadır.

${client.getEmoji('point')} \` Tier II (Streamer Görevi)       :\` Streamer odalarda saat kasma görevidir. Bu görevde Streamer odaları içerisinde AFK olarak geçirdiğiniz süreler sayılmamaktadır.

${client.getEmoji('point')} \` Tier III (Yetkili Çekme Görevi) :\` Sunucumuzda yetkili çekme görevidir. Çektiğiniz yetkililerin yan hesap olmaması gerekmektedir. Çektiğiniz yetkilileri .**yetkili @etiket** veya **.yetkili ID** komutu ile takımınıza almanız gerekir. Yan hesap tespiti halinde yaptırım uygulanabilir.

${client.getEmoji('point')} \` Tier IV (Mesaj Görevi)          :\` Sohbet odalarında mesaj atma görevidir. Bu görevde sohbet odalarında mesaj atarak görevinizi tamamlayabilirsiniz.

${client.getEmoji('point')} \` Tier V (Taglı Çekme Görevi)     :\` Sunucumuzda taglı çekme görevidir. Çektiğiniz üyelerin tagımızı alması gerekmektedir. Çektiğiniz üyeleri .**taglı @etiket** veya **.taglı ID** komutu ile takımınıza almanız gerekir. Yan hesap tespiti halinde yaptırım uygulanabilir.
`})
            ],
            components: [row]
        });
    }
};