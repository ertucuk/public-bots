const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js'); 

module.exports = {
    Name: 'ping',
    Aliases: ['ping', 'msg'],
    Description: 'Botun pingini gösterir',
    Usage: 'ping',
    Category: 'Root',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const db = await client.mongoose.ping()
        const msg = await message.reply({ content: `Ping hesaplanıyor...` })

        const embed = new EmbedBuilder()
        .setColor(message.guild?.members.me?.displayHexColor ?? 'Random')

        const heartbeat = `\`\`\`ini\n  [ ${Math.round(client.ws.ping)}ms ]\`\`\``
        const latency = `\`\`\`ini\n    [ ${Math.floor(msg.createdTimestamp - message.createdTimestamp - db)}ms ]\`\`\``
        const database = `\`\`\`ini\n   [ ${Math.floor(db)}ms ]\`\`\``

        embed.setTitle(`Hesaplandı!`)
        embed.addFields(
            {
                name: 'Client Heartbeat',
                value: heartbeat,
                inline: true
            },
            {
                name: 'Message Latency',
                value: latency,
                inline: true
            },
            {
                name: 'Database Ping',
                value: database,
                inline: true
            }
        )
        embed.setImage('https://dummyimage.com/2000x500/2b2d31/ffffff&text=' + client.ws.ping + '%20ms')
        embed.setFooter({
            text: message.member?.displayName ?? message.member.user.username,
            iconURL: message.member?.displayAvatarURL() ?? message.member.user.displayAvatarURL()
        })

        await msg.edit({ content: null, embeds: [embed] }).then(m => { setTimeout(() => { m.delete() }, 10000) })
    },
};