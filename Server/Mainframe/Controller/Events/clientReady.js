const { Events } = require("discord.js");
const { Presence } = require("../../../Global/Helpers");
const { Servers, User, Mute, VoiceMute, Jail, Punitive } = require("../../../Global/Settings/Schemas");
const { CronJob } = require("cron");

module.exports = {
    Name: Events.ClientReady,
    System: true,

    execute: async (client) => {
        const channel = client.channels.cache.get(client.system.voiceID);
        if (channel) await channel.join({ selfDeaf: true, selfMute: true, Interval: true });
        Presence(client);

        const data = await Servers.findOne({ serverID: client.system.serverID });

        const staffLeaves = new CronJob('0 0 * * *', async () => {
            const document = await Servers.findOne({ serverID: client.system.serverID });
            if (!document) return;

            const logChannel = client.channels.cache.find(c => c.name === 'staff-leave-log')
            if (!logChannel) return;

            if (document?.staffLeaves.length == 0) {
                logChannel.send({ content: `Bugün kimse yetkiyi bırakmamış. Çalışmaya devam!` });
                return;
            }

            await Servers.updateOne({ serverID: client.system.serverID }, { $set: { staffLeaves: [] } });
            logChannel.send({
                content: `Bugün ${document?.staffLeaves.length} kişi yetkiyi bırakmış.\n\n${document?.staffLeaves.map((d) => {
                    const roles = d.roles.map((r) => `<@&${r}>`).join(", ");
                    const timestamp = client.timestamp(d.timestamp);
                    return `[${timestamp}] <@${d.id}>: ${roles}`;
                }).join("\n")}`
            });
        }, null, true, "Europe/Istanbul");
        staffLeaves.start();

        const tagLeaves = new CronJob('0 0 * * *', async () => {
            const document = await Servers.findOne({ serverID: client.system.serverID });
            if (!document) return;

            const logChannel = client.channels.cache.find(c => c.name === 'tag-log-leave')
            if (!logChannel) return;

            if (document?.tagLeaves.length == 0) {
                logChannel.send({ content: `Bugün kimse tagımızı bırakmamış. Çalışmaya devam!` });
                return;
            }

            await Servers.updateOne({ serverID: client.system.serverID }, { $set: { tagLeaves: [] } });
            logChannel.send({
                content: `Bugün ${document?.tagLeaves.length} kişi tagımızı bırakmış.\n\n${document?.tagLeaves.map((d) => {
                    const roles = d.roles.map((r) => `<@&${r}>`).join(", ");
                    const timestamp = client.timestamp(d.timestamp);
                    return `[${timestamp}] <@${d.id}>: ${roles}`;
                }).join("\n")}`
            });
        }, null, true, "Europe/Istanbul");
        tagLeaves.start();

        async function tagControl() {
            const guild = client.guilds.cache.get(client.system.serverID);
            if (!guild) return;

            const members = guild.members.cache.filter(m => m.user.username.includes(data.serverTag) && !m.roles.cache.has(data.familyRole) && !m.roles.cache.has(data.quarantineRole) && !m.roles.cache.has(data.adsRole) && !m.roles.cache.has(data.underworldRole) && !m.roles.cache.has(data.suspectedRole) && !m.user.bot
            );

            if (members.size == 0) return;
            members.forEach(member => {
                if (!data.familyRole || !data.serverTag) return;
                member.roles.add(data.familyRole).catch()
                member.setNickname(member.displayName.replace(data.secondTag, data.serverTag)).catch()
            });
        }

        async function unregisterControl() {
            const guild = client.guilds.cache.get(client.system.serverID);
            let control = guild.members.cache.filter(m => m.roles.cache.filter(r => r.id !== guild.id).size == 0)
            if (control.size == 0) return;
            control.forEach(member => {
                if (data.public) {
                    if (member.manageable) member.setNickname(`${member.user.displayName.includes(data.serverTag) ? `${data.serverTag}` : (data.secondTag || "")} İsim | Yaş`).catch();
                    if (member.manageable) member.roles.add(data.unregisterRoles).catch()
                } else {
                    if (member.manageable) member.setNickname(`${data.secondTag} İsim | Yaş`).catch();
                    if (member.manageable) member.roles.add(data.unregisterRoles).catch()
                }
            })
        };

        async function suspectControl() {
            const guild = client.guilds.cache.get(client.system.serverID);
            if (!guild) return;

            const suspectMembers = guild.members.cache.filter(m => m.roles.cache.has(data.suspectedRole) && m.user.createdTimestamp < Date.now() - 1000 * 60 * 60 * 24 * 7);
            if (suspectMembers.size == 0) return;

            suspectMembers.forEach(member => {
                member.setRoles(data.unregisterRoles).catch();
            });
        };

        async function penalPointControl() {
            const guild = client.guilds.cache.get(client.system.serverID);
            if (!guild) return;

            const members = guild.members.cache.filter(m => !m.user.bot && !m.roles.cache.has(data.underworldRole))
            if (members.size == 0) return;

            members.forEach(async member => {
                const document = await User.findOne({ userID: member.id });
                if (!document) return;
                if (document.PenalPoints == 0) return;

                const logChannel = await client.getChannel('ceza-işlem', member)
                const penalPoints = document.PenalPoints;
                if (penalPoints >= 50) {
                    const chatMute = await Mute.findOne({ ID: member.id });
                    const voiceMute = await VoiceMute.findOne({ ID: member.id });
                    const jail = await Jail.findOne({ ID: member.id });
        
                    if (chatMute) await Mute.deleteOne({ ID: member.id });
                    if (voiceMute) await VoiceMute.deleteOne({ ID: member.id });
                    if (jail) await Jail.deleteOne({ ID: member.id });
                    await Punitive.updateMany({ Member: member.id, Active: true }, { $set: { Active: false, Remover: client.user.id, Expried: Date.now() } });
        
                    await member.Punitive(client, "Underworld", '50 Ceza Puanına Ulaşmak');
                    if (logChannel) logChannel.send({ content: `${member} adlı üye 50 ceza puanına ulaştığı için karantinaya gönderildi.` });
                }
            })
        }

        async function boosterControl() {
            const guild = client.guilds.cache.get(client.system.serverID);
            if (!guild) return;

            const members = guild.members.cache.filter(m => !m.user.bot && !m.roles?.cache.has(guild.settings.familyRole) && !m.roles?.cache.has(guild.roles.premiumSubscriberRole?.id) && !m.user.displayName.includes('|'))
            if (members.size == 0) return;

            members.forEach(async member => {
                const userData = await User.findOne({ userID: member.id }); 
                if (!userData) return;
                if (!userData.userName) return;

               if (member.manageable) member.setNickname(`${guild.settings.secondTag} ${userData.userName}`).catch();
            })
        }

        if (data.public) setInterval(() => { tagControl(); }, 20000);
        setInterval(() => { boosterControl(); }, 60000);
        setInterval(() => { unregisterControl(); }, 20000);
        setInterval(() => { suspectControl(); }, 20000);
        setInterval(() => { penalPointControl(); }, 10000);
    }
};