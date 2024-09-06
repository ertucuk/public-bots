const { Events } = require("discord.js");
const { User, Invite, Servers } = require("../../../Global/Settings/Schemas");

module.exports = {
  Name: Events.GuildMemberRemove,
  System: true,

  execute: async (client, member) => {
    const UserData = await User.findOne({ userID: member.user.id });
    if (UserData && UserData.userName) {
      await User.findOneAndUpdate({ userID: member.id }, { $push: { "Names": { Name: UserData.userName, Reason: `Sunucudan Ayrılma`, Type: 'Quit', Date: Date.now() } } }, { upsert: true })
    }
  }
};          