const { Events } = require('discord.js')
const { InteractionHandler } = require('./Functions')
module.exports = {
  Name: Events.InteractionCreate,
  System: true,

  execute: async (client, interaction) => {
    InteractionHandler(client, interaction)
  }
}
