const { Events } = require('discord.js')
const { boosterRole, punishHandler, roleLog } = require('./Functions')

module.exports = {
  Name: Events.GuildMemberUpdate,
  System: true,

  execute: async (client, oldMember, newMember) => {
    boosterRole(client, oldMember, newMember)
    punishHandler(client, newMember)
    roleLog(client, oldMember, newMember)
  }
}
