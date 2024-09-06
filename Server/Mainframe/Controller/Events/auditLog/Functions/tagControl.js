const { AuditLogEvent, PermissionFlagsBits } = require('discord.js')

module.exports = async function tagControl(client, log, guild) {
    if (log.executor.bot) return;
    const staffMember = await guild.members.fetch(log.executor.id);
    if (staffMember.permissions.has(PermissionFlagsBits.Administrator)) return;
    const member = await guild.members.fetch(log.target.id);
    if (!member) return;

    log.changes.forEach(change => {
        if (change.key === 'nick') {
            if (change.old.includes(guild.settings.serverTag) && !change.new.includes(guild.settings.serverTag)) member.setNickname(change.old).catch(() => { });
            if (change.old.includes(guild.settings.secondTag) && !change.new.includes(guild.settings.secondTag)) member.setNickname(change.old).catch(() => { });
        }
    });
}