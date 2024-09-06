const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Staff, Servers } = require("../../../../../Global/Settings/Schemas");

module.exports = async function tagHandler(client, oldUser, newUser, member) {

    if (member.user.bot) return

    if (!member.guild.settings.manRoles.some((r) => member.roles.cache.has(r)) && !member.guild.settings.womanRoles.some((r) => member.roles.cache.has(r)) && !member.guild.settings.unregisterRoles.some((r) => member.roles.cache.has(r))) return

    const oldHasTag = member.guild.settings.serverTag.split('').some((t) => oldUser.displayName.includes(t))
    const newHasTag = member.guild.settings.serverTag.split('').some((t) => newUser.displayName.includes(t))
    const tagMemberCount = member.guild.members.cache.filter((m) => m.user.displayName.includes(member.guild.settings.serverTag))

    const tagJoin = await client.getChannel("tag-log-join", member)
    const tagLeave = await client.getChannel("tag-log-leave", member)
    if (!tagJoin || !tagLeave) return console.log('tag-log-join veya tag-log-leave adında bir kanal bulunamadı!');

    if (!oldHasTag && newHasTag) {
        member.roles.add(member.guild.settings.familyRole)
        setTimeout(() => {
            member.setNickname(member.displayName.replace(member.guild.settings.secondTag, member.guild.settings.serverTag)).catch(() => { })
        }, 1000)

        if (tagJoin)
            tagJoin.send({
                embeds: [
                    new EmbedBuilder({
                        footer: { text: `Sunucunun %${((tagMemberCount.size / member.guild.memberCount) * 100).toFixed(2)} taglı.`, iconURL: member.guild.iconURL() },
                        description: `${member} adlı kullanıcı tagımızı alarak aramıza katıldı!`,
                        fields: [
                            { name: 'Kullanıcı', value: `${member}(\`${member.id}\`)`, inline: true },
                            { name: 'Tarih', value: `${client.timestamp(Date.now(), 'f')}\n${client.timestamp(Date.now())}`, inline: true },
                            { name: `Bilgilendirme`, value: `Sunucumuzda toplam **${tagMemberCount.size}** taglı üye bulunmakta.`, inline: true }
                        ]
                    })
                ]
            })
    }

    if (oldHasTag && !newHasTag) {

        member.setNickname(member.displayName.replace(member.guild.settings.serverTag, member.guild.settings.secondTag)).catch(() => { })

        setTimeout(() => {
            member.roles.remove(member.guild.settings.familyRole)
        }, 2000)

        const role = member.guild.roles.cache.get(member.guild.settings.minStaffRole)

        await Servers.updateOne(
            { serverID: member.guild.id },
            {
                $push: {
                    tagLeaves: {
                        id: member.id,
                        timestamp: Date.now(),
                        roles: member.roles.cache.filter((r) => role.position < r.position && !r.managed && r.id !== member.guild.id).map((r) => r.id)
                    }
                }
            }
        );

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('tag-leave').setLabel('İlgileniyorum').setStyle(ButtonStyle.Secondary));
        tagLeave.send({
            content: `<@&${member.guild.settings.returnResponsible}> <@&${member.guild.settings.returnController}>`,
            components: [row],
            embeds: [
                    new EmbedBuilder({
                        color: client.random(),
                        description: `${member} adlı kullanıcı tagımızı çıkardı ve ailemizden ayrıldı!`,
                        fields: [
                            { name: 'Kullanıcı', value: `${member}(\`${member.id}\`)`, inline: true },
                            { name: 'Tarih', value: `${client.timestamp(Date.now(), 'f')}\n${client.timestamp(Date.now())}`, inline: true },
                            { name: `Bilgilendirme`, value: `Sunucumuzda toplam **${tagMemberCount.size}** taglı üye bulunmakta.`, inline: true }
                        ]
                    })
                ]
            })

            if (member.guild.settings.taggedMode === true && !member.roles.cache.has(member.guild.roles.premiumSubscriberRole.id)) {
                member.roles.set(member.guild.settings.unregisterRoles).catch(() => { })
                member.setNickname(`${member.guild.settings.secondTag} İsim | Yaş`).catch(() => { })
                member.send({ content: `Merhaba ${member}, tagımızı çıkardığın için otomatik olarak kayıtsıza atıldın. Eğer tekrar aramıza katılmak istersen, tagımızı alarak tekrar aramıza katılabilirsin. İyi günler dileriz.` }).catch(() => { })
            }
    }
}