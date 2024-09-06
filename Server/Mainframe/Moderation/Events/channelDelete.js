const { Events, ChannelType, AuditLogEvent } = require("discord.js");
const VanteEmbed = require("../../../Global/Services/Embed")
const { User } = require('../../../Global/Settings/Schemas')
const { SecretRoom } = require('../../../Global/Settings/Schemas')

module.exports = {
    Name: Events.ChannelDelete,
    System: true,

    execute: async (client, channel) => {
        const ChannelLog = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
        const Entry = ChannelLog.entries.first();
        const User = Entry.executor;
        if (!User || User.bot) return;
        const secretRoom = await SecretRoom.findOne({ id: channel.id });
        if (!secretRoom) return;
        await SecretRoom.deleteMany({ id: channel.id });
    }   
};