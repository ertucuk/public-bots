const { bold, inlineCode, Collection, Events } = require("discord.js");
const { User } = require('../../../Global/Settings/Schemas');
const Staffs  = require("../../../Global/Base/Staff");
const collect = new Collection();

module.exports = {
    Name: Events.GuildMemberAdd,
    System: true,

    execute: async (client, member) => {
        if (member.user.bot) return;
        const joinLog = await client.getChannel('join-log', member)
        const logChannel = member.guild.channels.cache.get(member.guild.settings.inviterChannel)
    
        const fetchInvites = client.invites.get(member.guild.id) || new Collection();
        const invitesData = await member.guild.invites.fetch();
        const invite = invitesData.find((x) => fetchInvites.has(x.code) && fetchInvites.get(x.code).uses < x.uses) || member.guild.vanityURLCode;
        
        client.guilds.cache.forEach(async (guild) => {
            guild.invites.fetch().then((e) => {
                e.map((x) => { collect.set(x.code, { uses: x.uses, inviter: x.inviter, code: x.code, guild: guild.id }) });
                client.invites.set(guild.id, collect);
            });
        })
    
        const isSuspect = 1000 * 60 * 60 * 24 * 7 >= Date.now() - member.user.createdTimestamp;

        if (joinLog) joinLog.send({ content: `${client.getEmoji('check')} ${member} üyesi sunucumuza katıldı.` });
    
        if (!invite || !invite.inviter) {
            if (logChannel) logChannel.send(`${client.getEmoji('check')} ${member} üyesi sunucumuza ${bold('ÖZEL URL')} tarafından davet edildi.`);
            return;
        }

        if (invite.inviter.bot) return;
        const document = await User.findOneAndUpdate(
            { userID: invite?.inviter?.id },
            { $inc: { NormalInvites: isSuspect ? 0 : 1 } },
            { upsert: true, new: true },
        );
    
        await User.updateOne(
            { userID: member.id },
            { $set: { UserInviter: invite?.inviter?.id } },
            { upsert: true },
        );

        if (!member.guild.settings.maxStaffs.some(r => member.roles.cache.has(r))) Staffs.addPoint(invite?.inviter, 'invite');

        if (logChannel) logChannel.send({ content: `${client.getEmoji('check')} ${member} üyesi sunucumuza katıldı. ${inlineCode(invite?.inviter?.username)} tarafından davet edildi, ve bu kişinin toplam davet sayısı (${bold(`${document.NormalInvites}`)}) oldu ${isSuspect ? '🚫' : ''}` });
    }
};