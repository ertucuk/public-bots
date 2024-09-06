const { VoiceMute } = require("../../../../../Global/Settings/Schemas");

module.exports = async function punishHandler(client, oldState, newState) {
    if (newState.member.user.bot) return;
    const member = newState.guild.members.cache.get(newState.id);
    const vMuteCheck = await VoiceMute.findOne({ ID: member.id });
    if (vMuteCheck) {
        if (!newState.serverMute) newState.setMute(true);
    }
}