const { Events, ChannelType, AuditLogEvent } = require("discord.js");
const { Snipe } = require('../../../Global/Settings/Schemas')

module.exports = {
    Name: Events.MessageDelete,
    System: true,

    execute: async (client, message) => {
        if (message.author.bot || !message.guild || message.content == null) return;

        await Snipe.findOneAndUpdate(
            { guildID: message.guild.id },
            {
                $set: {
                    [`deletedMessages.${message.id}`]: {
                        content: message.content || 'Görsel içerik.',
                        author: {
                            id: message.author.id,
                            tag: message.author.tag,
                        },
                        timestamp: Date.now(),
                        attachments: message.attachments.first() ? message.attachments.first().proxyURL : null,
                    },
                },
            },
            { upsert: true }
        );

        const entry = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete }).then(audit => audit.entries.first());

        const embed = new global.VanteEmbed()
            .setFooter({ text: message.guild.name + ' | ' + `Created By Ertu`, iconURL: message.guild.iconURL({ dynamic: true, size: 2048 }) })
            .setTimestamp()
            .setDescription(`${message.author} üyesine ait ${message.channel} kanalında bir mesaj silindi!\nMesaj İçeriği:\`\`\`fix\n${message.content.length > 1024 ? `${message.content.slice(0, 1021)}...` : message.content}\n\`\`\``)
            .addFields(
                { name: 'Kanal', value: `${message.channel}\n(\`${message.channel.id}\`)`, inline: true },
                { name: 'Silen', value: `${entry.executor}\n(\`${entry.executor.id}\`)`, inline: true },
                { name: 'Tarih', value: `${client.timestamp(Date.now(), "f")}\n${client.timestamp(Date.now())}`, inline: true },
            )

        const logChannel = await client.getChannel("message-log", message);
        if (!logChannel) return console.log(`Mesaj silindi fakat log kanalı bulunamadı!`);

        if (!message.attachments.first()) logChannel.send({ embeds: [embed] });
        if (message.attachments.first()) {
            const embed = new global.VanteEmbed()
                .setFooter({ text: message.guild.name + ' | ' + `Created By Ertu`, iconURL: message.guild.iconURL({ dynamic: true, size: 2048 }) })
                .setTimestamp()
                .setImage(message.attachments.first().proxyURL)
                .setDescription(`${message.author} üyesine ait ${message.channel} kanalında bir içerik (dosya) silindi!`)
                .addFields(
                    { name: 'Kanal', value: `${message.channel}\n(\`${message.channel.id}\`)`, inline: true },
                    { name: 'Silen', value: `${entry.executor}\n(\`${entry.executor.id}\`)`, inline: true },
                    { name: 'Tarih', value: `${client.timestamp(Date.now(), "f")}\n${client.timestamp(Date.now())}`, inline: true },
                )
            logChannel.send({ embeds: [embed] });
        }
    }
};