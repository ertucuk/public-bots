const { afkHandler, commandHandler, complimentHandler, specialHandler, gamesHandler } = require('./Functions')
const { Events } = require('discord.js')

module.exports = {
    Name: Events.MessageCreate,
    System: true,

    execute: async (client, message) => {
        if (!message.guild || message.author.bot || !message.content) return;

        if (message.attachments.size === 0 && message.guild.settings.photoChannels.some(x => message.channel.id === x)) return message.delete();
        if (message.activity && message.activity.partyId.startsWith("spotify:")) return message.delete().catch(err => {})
        if (message.guild.settings.public && message.content === '.tag' ) return message.reply({ content: `${message.guild.settings.serverTag}` })

        const prefixes = [...client.system.Main.Prefix, `<@${client.user.id}>`, `<@!${client.user.id}>`]
        const prefix = prefixes.find((p) => message.content.startsWith(p))

        commandHandler(client, message, prefix)
        afkHandler(client, message, prefix)
        complimentHandler(client, message)
        specialHandler(client, message, prefix)
        gamesHandler(client, message)
    }
};