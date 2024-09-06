const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Staff, Servers } = require("../../../../../Global/Settings/Schemas");
const Staffs = require("../../../../../Global/Base/Staff");

module.exports = async function tagHandler(client, oldUser, newUser, member) {
    if (!member.guild.settings.manRoles.some((r) => member.roles.cache.has(r)) && !member.guild.settings.womanRoles.some((r) => member.roles.cache.has(r))) return

    const oldHasTag = member.guild.settings.serverTag.split('').some((t) => oldUser.displayName.includes(t))
    const newHasTag = member.guild.settings.serverTag.split('').some((t) => newUser.displayName.includes(t))
    
    const staffLeave = await client.getChannel("staff-leave-log", member)
    if (!staffLeave) return console.log('staff-leave-log adında bir kanal bulunamadı!');

    const role = member.guild.roles.cache.get(member.guild.settings.minStaffRole)

    if (oldHasTag && !newHasTag) {
        if (member.guild.settings.staffs.some((r) => member.roles.cache.has(r))) {
            await Servers.updateOne(
                { serverID: member.guild.id },
                {
                    $push: {
                        staffLeaves: {
                            id: member.id,
                            timestamp: Date.now(),
                            roles: member.roles.cache.filter((r) => role.position < r.position && !r.managed && r.id !== member.guild.id).map((r) => r.id)
                        }
                    }
                }
            );

            member.roles.set(member.roles.cache.filter((r) => role.position > r.position && !r.managed)).catch(() => { })

            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('staff-leave').setLabel('İlgileniyorum').setStyle(ButtonStyle.Secondary));
            staffLeave.send({
                content: `<@&${member.guild.settings.returnResponsible}> <@&${member.guild.settings.returnController}>`,
                components: [row],
                embeds: [
                    new EmbedBuilder({
                        color: client.random(),
                        description: `${member} adlı kullanıcı ${member.guild.settings.serverTag} tagımızı çıkararak yetkili ailemizden ayrıldı!`,
                        fields: [
                            { name: 'Kullanıcı', value: `${member}\n(\`${member.id}\`)`, inline: true },
                            { name: 'Tarih', value: `${client.timestamp(Date.now(), 'f')}\n${client.timestamp(Date.now())}`, inline: true },
                            {
                                name: `Üstünden Alınan Roller [${member.roles.cache.filter((r) => role.position <= r.position && !r.managed).size}]`,
                                value: member.roles.cache.filter((r) => role.position <= r.position && !r.managed).size > 0 ? member.roles.cache.filter((r) => role.position <= r.position && !r.managed).map((r) => r).listArray() : 'Rol bulunamadı!'
                            }
                        ]
                    })
                ]
            })
        }
    }
}