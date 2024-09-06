const { Jail, Mute, VoiceMute, ForceBan, Punitive, Ads } = require("../../../../../Global/Settings/Schemas");

module.exports = async function Punish(client, member) {

    if (member.user.bot) return;

    const ChatMute = await Mute.find({ ID: member.id });
    punish(member, ChatMute, 'Mute');

    const Voices = await VoiceMute.find({ ID: member.id });
    punish(member, Voices, 'Voice-Mute');

    const Jails = await Jail.find({ ID: member.id });
    punish(member, Jails, 'Jail');

    const ads = await Ads.find({ ID: member.id });
    punish(member, ads, 'Ads');

    const underWorld = await Punitive.find({ Member: member.id, Type: 'Underworld', Active: true });
    punish(member, underWorld, 'Underworld');

    const streamerPunish = await Punitive.find({ Member: member.id, Type: 'Streamer Ceza', Active: true });
    punish(member, streamerPunish, 'Streamer');

    const eventPunish = await Punitive.find({ Member: member.id, Type: 'Etkinlik Ceza', Active: true });
    punish(member, eventPunish, 'Etkinlik');
}

async function punish(member, activePunish, muteType = 'Mute' || 'Jail' || 'Voice-Mute' || 'Underworld' || 'Ads' || 'Streamer' || 'Etkinlik') {
    const active = activePunish[0];
    if (!active) return;

    if (muteType === 'Mute') {
        await member.roles.add(member.guild.settings.chatMuteRole).catch()
    } else if (muteType === 'Voice-Mute') {
        await member.roles.add(member.guild.settings.voiceMuteRole).catch()
    } else if (muteType === 'Jail') {
        await member.setRoles(member.guild.settings.quarantineRole).catch()
    } else if (muteType === 'Ads') {
        await member.setRoles(member.guild.settings.adsRole).catch()
    } else if (muteType === 'Underworld') {
        await member.setRoles(member.guild.settings.underworldRole).catch()
    } else if (muteType === 'Streamer') {
        await member.roles.add(member.guild.settings.stRole).catch()
    } else if (muteType === 'Etkinlik') {
        await member.roles.add(member.guild.settings.etRole).catch()
    }
}