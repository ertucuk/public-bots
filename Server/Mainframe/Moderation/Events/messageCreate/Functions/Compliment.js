let complimentCounter = 0

module.exports = async function complimentHandler(client, message) {

    if (message.author.bot || !message.guildId || message.guild.settings.chatChannel !== message.channelId) return

    complimentCounter++
    if (complimentCounter !== 100) return
    complimentCounter = 0

    message.reply({ content: client.data.iltifatlar[Math.floor(Math.random() * client.data.iltifatlar.length)] })
}