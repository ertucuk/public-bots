const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, Client, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'botayar',
    Aliases: ['botsettings', 'bot-ayar', 'bot-ayarlar', 'botpanel', 'bot-panel'],
    Description: 'Bot ayarlarını gösterir.',
    Usage: 'botayar',
    Category: 'Root',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const botsData = []
        global.ertuBots.Main.forEach((client) => {
            botsData.push({
                value: client.id,
                description: `${client.id}`,
                label: `${client.bot.username}`,
                emoji: { id: '1171748850814423041' }
            })
        })

        global.ertuBots.Welcome.forEach((client) => {
            const member = message.guild.members.cache.get(client.id)
            botsData.push({
                value: client.id,
                description: member.voice.channel ? `${member.voice.channel.name} Kanalının Ses Botu` : `${client.id}`,
                label: `${client.bot.username}`,
                emoji: { id: '1171748850814423041' }
            })
        })

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("selectBot")
                    .setPlaceholder("Güncellenmesini istediğiniz botu seçin.")
                    .setOptions(botsData)
            )

        message.channel.send({ content: `Merhaba ${message.author} güncellemek istediğiniz botu aşağıdaki menüden seçebilirsiniz!`, components: [row] })
    },
};