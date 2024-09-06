const { Events, Collection } = require("discord.js");
const { Presence } = require("../../../Global/Helpers");
const collect = new Collection();

module.exports = {
  Name: Events.ClientReady,
  System: true,

  execute: async (client) => {
    const channel = client.channels.cache.get(client.system.voiceID);
    if (channel) await channel.join({ selfDeaf: true, selfMute: true, Interval: true });
    Presence(client);

    client.guilds.cache.forEach(async (guild) => {
      guild.invites.fetch().then((e) => {
          e.map((x) => { collect.set(x.code, { uses: x.uses, inviter: x.inviter, code: x.code, guild: guild.id }) });
          client.invites.set(guild.id, collect);
      });
    });
  }
};