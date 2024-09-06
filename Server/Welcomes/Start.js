const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice')
const { Presence } = require("../Global/Helpers");
const { Client } = require('./Client')
const { Welcome } = require('../Global/Settings/System')

for (let i = 0; i < Welcome.Tokens.length; i++) {
  const token = Welcome.Tokens[i]
  const channel = Welcome.Channels.length > 0 ? Welcome.Channels[i] : Welcome.Channels[0]

  if (token && channel) {
    const client = new Client()
    client.on('ready', async () => {
      Presence(client);

      const Server = client.guilds.cache.get(client.system.serverID);
      const Channel = Server ? Server.channels.cache.get(channel) : null;

      if (!Server || !Channel) throw new Error('Sunucu veya kanal bulunamadı');

      const connection = joinVoiceChannel({
        channelId: Channel.id,
        guildId: Channel.guild.id,
        adapterCreator: Channel.guild.voiceAdapterCreator,
        group: client.user.id
      });

      connection.on('error', (error) => {
        console.error('Ses bağlantı hatası:', error);
        connection.rejoin();
      });

    });

    client.login(token).catch((err) => { })
  }
}