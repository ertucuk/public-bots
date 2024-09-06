const { Events } = require("discord.js");
const { statHandler, staffHandler } = require('./Functions');

module.exports = {
  Name: Events.MessageCreate,
  System: true,

  execute: async (client, message) => {
    statHandler(client, message);
    staffHandler(client, message);
  }
};


