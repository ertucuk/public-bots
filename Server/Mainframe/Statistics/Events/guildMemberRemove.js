const { bold, inlineCode, Collection, Events } = require("discord.js");
const { User } = require('../../../Global/Settings/Schemas')

module.exports = {
    Name: Events.GuildMemberRemove,
    System: true,

    execute: async (client, member) => {
        if (member.user.bot) return;

        const joinLog = await client.getChannel('join-log', member)
        const logChannel = member.guild.channels.cache.get(member.guild.settings.inviterChannel)
        const isSuspect = 1000 * 60 * 60 * 24 * 7 >= Date.now() - member.user.createdTimestamp;

        if (joinLog) joinLog.send({ content: `${client.getEmoji('mark')} ${member} üyesi sunucumuzdan ayrıldı.` });

        const memberData = await User.findOne({ userID: member.id });
        if (!memberData || !memberData.UserInviter) {
            if (logChannel) logChannel.send({ content: `${client.getEmoji('mark')} ${member} üyesi sunucumuzdan ayrıldı. ${bold('ÖZEL URL')} tarafından davet edilmişti.` });
            return;
        }
    
        const inviterData = await User.findOne({ userID: memberData.UserInviter });
        if (!inviterData) {
            if (logChannel) logChannel.send({ content: `${client.getEmoji('mark')} ${member} üyesi sunucumuzdan ayrıldı. Kim tarafından davet edildiği bulunamadı.` });
            return;
        }
    
        memberData.UserInviter = undefined;
        memberData.markModified('UserInviter');
        memberData.save();
    
        const inviter = await client.users.fetch(inviterData.userID);
        if (!isSuspect) inviterData.NormalInvites -= 1;
        inviterData.LeaveInvites += 1;
        inviterData.markModified('LeaveInvites NormalInvites');
        inviterData.save();
    
        if (logChannel) logChannel.send({ content: `${client.getEmoji('mark')} ${member} üyesi sunucumuzdan ayrıldı. ${inlineCode(inviter.username)} tarafından davet edilmişti bu kişinin toplam (${bold(`${inviterData.NormalInvites}`)}) daveti oldu.` });
        return;
    }
};