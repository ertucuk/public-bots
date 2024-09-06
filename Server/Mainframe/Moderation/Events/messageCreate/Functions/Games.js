const { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
var number = 0;

module.exports = async function gameHandler(client, message) {
    if (message.channel.id !== message.guild.settings?.chatChannel || message.author.bot || !message.guild) return;

    number++
    if (number == 100) {
        const chatChannel = message.guild.channels.cache.get(message.guild.settings.chatChannel);
        if (!chatChannel) return;

        let click = []
        let answer = Math.floor(Math.random() * 5) + 1

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("1").setEmoji(`1️⃣`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("2").setEmoji(`2️⃣`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("3").setEmoji(`3️⃣`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("4").setEmoji(`4️⃣`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("5").setEmoji(`5️⃣`).setStyle(ButtonStyle.Secondary),
        )

        const msg = await chatChannel.send({
            content: `Sayı tahmin etme oyunu başladı! 1-5 arasında bir sayı tahmin edin. İyi şanslar!`,
            components: [row]
        })

        const collector = msg.createMessageComponentCollector({ time: 15000 })
        collector.on("collect", async (button) => {
            if (button.customId === String(answer)) {
                if (click.includes(button.user.id)) return button.reply({ content: `Cevap hakkınızı doldurmuşsunuz. Üzgünüm!`, ephemeral: true })
                await button.reply({ content: `Tebrikler! Doğru cevap verdiniz.`, ephemeral: true })
                chatChannel.send({ content: `**Tebrikler!** Doğru kasayı bul etkinliğini ${button.user} kazandı!` })
                msg.delete();
                click = []
            } else {
                if (click.includes(button.user.id)) return button.reply({ content: `Cevap hakkınızı doldurmuşsunuz. Üzgünüm!`, ephemeral: true })
                await button.reply({ content: `Üzgünüm! Yanlış cevap verdiniz.`, ephemeral: true })
                click.push(button.user.id)
            }
        });
    } else if (number == 200) {
        number = 0
        const chatChannel = message.guild.channels.cache.get(message.guild.settings.chatChannel);
        if (!chatChannel) return;

        let click = []
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('clicktowin').setLabel('Tıkla!').setStyle(ButtonStyle.Secondary));

        const msg = await chatChannel.send({
            content: `Hızlı tıkla etkinliği başladı! Hızlıca ilk tıkla ve kazan!`,
            components: [row]
        })

        const collector = msg.createMessageComponentCollector({ time: 10000 })
        collector.on("collect", async (button) => {
            if (button.customId === 'clicktowin') {
                if (click.includes(button.user.id)) return button.reply({ content: `Bu etkinliği zaten kazandınız.`, ephemeral: true })
                msg.delete();
                chatChannel.send({ content: `**Tebrikler!** Hızlıca tıkla etkinliğini ${button.user} kazandı!` })
                click = []
            }
        });

        collector.on("end", async (reason) => {
            if (reason === 'time') {
                if (msg) msg.delete();
                chatChannel.send({ content: `Hızlıca tıkla etkinliği sona erdi! Kimse kazanamadı.` })
            }
        });
    }
}