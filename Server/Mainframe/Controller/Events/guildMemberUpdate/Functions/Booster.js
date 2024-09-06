const { User } = require("../../../../../Global/Settings/Schemas");

module.exports = async function boostHandler(client, oldMember, newMember) {
        if (oldMember.roles.cache.has(newMember.guild.roles.premiumSubscriberRole.id) && !newMember.roles.cache.has(newMember.guild.roles.premiumSubscriberRole.id)) {
            const userData = await User.findOne({ ID: newMember.id });
            const chatChannel = newMember.guild.channels.cache.get(newMember.guild.settings.chatChannel);

            if (newMember.guild.settings.ownerRoles.some(roleID => newMember.roles.cache.has(roleID))) return;
            
            if (newMember.guild.settings.taggedMode) {
                if (newMember.roles.cache.has(newMember.guild.settings.vipRole)) return;
                if (chatChannel) chatChannel.send(`${newMember} adlı üye boostunu çektiği için kayıtsıza atıldı.`);
                if (newMember.voice.channel) newMember.voice.disconnect().catch(() => {});
                if (newMember.manageable) await newMember.roles.set(newMember.guild.settings.unregisterRoles);
            } else {
                if (userData && userData.userName && userData.Names) {
                    if (newMember.manageable) await newMember.setNickname(`${newMember.displayName.includes(newMember.guild.settings.serverTag) ? `${newMember.guild.settings.serverTag}` : newMember.guild.settings.secondTag || ""} ${userData.userName}`);
                    if (chatChannel) chatChannel.send(`${newMember} adlı üye boostunu çektiğinden dolayı isim ve yaşı düzenlendi.`);
                }
            }
        }
}