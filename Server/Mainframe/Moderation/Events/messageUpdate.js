const { Events, ChannelType, AuditLogEvent } = require("discord.js");
const { Snipe } = require('../../../Global/Settings/Schemas')

module.exports = {
    Name: Events.MessageUpdate,
    System: true,

    execute: async (client, oldMessage, newMessage) => {
        if (oldMessage.author.bot || !oldMessage.guild || newMessage.channel.type != 0) return;
        if (oldMessage.content == newMessage.content) return;
        if (oldMessage.content.length > 1024 || newMessage.content.length > 1024) return;

        const embed = new global.VanteEmbed()
            .setFooter({ text: oldMessage.guild.name + ' | ' + `Created By Ertu`, iconURL: oldMessage.guild.iconURL({ dynamic: true, size: 2048 }) })
            .setTimestamp()
            .setDescription(`${oldMessage.author} tarafından ${oldMessage.channel} kanalında bir mesaj düzenlendi!\n\nEski Mesaj İçeriği:\`\`\`fix\n${oldMessage.content}\n\`\`\`\nYeni Mesaj İçeriği:\`\`\`fix\n${newMessage.content}\n\`\`\``)
            .addFields(
                { name: 'Kanal', value: `${oldMessage.channel}\n(\`${oldMessage.channel.id}\`)`, inline: true },
                { name: 'Düzenleyen', value: `${oldMessage.author}\n(\`${oldMessage.author.id}\`)`, inline: true },
                { name: 'Tarih', value: `${client.timestamp(Date.now(), "f")}\n${client.timestamp(Date.now())}`, inline: true },
            )

        const logChannel = await client.getChannel("message-log", oldMessage);
        if (!logChannel) return console.log(`Mesaj düzenlendi fakat log kanalı bulunamadı!`);
        logChannel.send({ embeds: [embed] });
    }
};