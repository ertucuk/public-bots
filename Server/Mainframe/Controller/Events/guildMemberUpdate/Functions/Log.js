const { User } = require("../../../../../Global/Settings/Schemas");
const { AuditLogEvent } = require('discord.js')

module.exports = async function logHandler(client, oldMember, newMember) {
    if (oldMember.roles.cache.map((r) => r.id) === newMember.roles.cache.map((r) => r.id)) return;

    const entry = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate }).then((audit) => audit.entries.first());
    if (!entry || !entry.executor || entry.targetId !== newMember.id || Date.now() - entry.createdTimestamp > 5000) return;

    const role = oldMember.roles.cache.difference(newMember.roles.cache).first();
    if (!role) return;
    const isRemove = oldMember.roles.cache.size > newMember.roles.cache.size;

    await User.updateOne({ userID: newMember.id }, { $push: { RoleLogs: { admin: entry.executor.id, type: isRemove ? 'AdminÇıkarma' : 'AdminEkleme', time: Date.now(), roles: [role.id] } } }, { upsert: true });

    const channel = await client.getChannel("role-log", newMember)
    if (channel) {
        channel.send({
            embeds: [
                new client.VanteEmbed()
                    .setTimestamp()
                    .setAuthor({ name: entry.executor.tag, iconURL: entry.executor.displayAvatarURL({ dynamic: true, size: 2048 }) })
                    .setDescription(`${entry.executor} tarafından ${newMember} ${isRemove ? 'üyesinden rol kaldırıldı.' : 'üyesine rol eklendi.'} (Sağ Tık)`)
                    .addFields([
                        { name: 'Kullanıcı', value: `${newMember}\n(\`${newMember.id}\`)`, inline: true },
                        { name: 'Yetkili', value: `${entry.executor}\n(\`${entry.executor.id}\`)`, inline: true },
                        { name: `Rol`, value: `${role.toString()}\n(\`${role.id}\`)`, inline: true },
                    ])
            ]
        })
    }
}