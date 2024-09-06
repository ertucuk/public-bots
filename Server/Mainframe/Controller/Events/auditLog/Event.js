const { Events, AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const { logHandler, tagHandler, nameHandler } = require("./Functions");

module.exports = {
    Name: Events.GuildAuditLogEntryCreate,
    System: true,

    execute: async (client, log, guild) => {
        if (log.action !== AuditLogEvent.MemberUpdate) return;
        logHandler(client, log, guild);
        nameHandler(client, log, guild);
        if (guild.settings.public) tagHandler(client, log, guild);
    }
};          