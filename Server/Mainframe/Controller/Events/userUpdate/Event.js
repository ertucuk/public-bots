const { Events } = require("discord.js");
const { BannedTagHandler, TagHandler, StaffHandler } = require("./Functions");

module.exports = {
    Name: Events.UserUpdate,
    System: true,

    execute: async (client, oldUser, newUser) => {

        if (oldUser.bot || oldUser.displayName === newUser.displayName) return

        const guild = client.guilds.cache.get(client.system.serverID)
        if (!guild) return

        const member = guild.members.cache.get(newUser.id)
        BannedTagHandler(client, oldUser, member)
        if (guild.settings.public) StaffHandler(client, oldUser, newUser, member)
        if (guild.settings.public) TagHandler(client, oldUser, newUser, member)
    }
};                        