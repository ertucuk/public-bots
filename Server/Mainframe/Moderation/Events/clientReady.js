const { Events } = require("discord.js");
const { Presence } = require("../../../Global/Helpers");
const { Client, Partials, GatewayIntentBits, Collection, ApplicationCommandType, ButtonStyle, Options, EmbedBuilder, bold } = require('discord.js');
const { Jail, Mute, VoiceMute, Punitive, User, Servers, SecretRoom, Ads } = require("../../../Global/Settings/Schemas");

module.exports = {
  Name: Events.ClientReady,
  System: true,

  execute: async (client) => {
    const channel = client.channels.cache.get(client.system.voiceID);
    if (channel) await channel.join({ selfDeaf: true, selfMute: true, Interval: true });
    Presence(client);

    const ertuBots = (global.ertuBots = {
      Main: [],
      Welcome: []
    })

    const Tokens = [
      client.system.Main.Moderation,
      client.system.Main.Statistics,
      client.system.Main.Controller,
    ]

    const WelcomeTokens = client.system.Welcome.Tokens

    Promise.all(
      Tokens.map(async (token) => {
        const data = await client.fetchClient(token)
        if (data) ertuBots.Main.push(data)
      })
    )

    Promise.all(
      WelcomeTokens.map(async (token) => {
        const data = await client.fetchClient(token)
        if (data) ertuBots.Welcome.push(data)
      })
    )

    setInterval(async () => {
      const ChatMute = await Mute.find({})
      const guild = client.guilds.cache.get(client.system.serverID);
      ChatMute.forEach(async (data) => {
        const member = guild.members.cache.get(data.ID);
        if (!member && data.Duration && Date.now() >= data.Duration) {
          await Mute.deleteOne({ ID: data.ID })
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
        }

        if (member && data.Duration && Date.now() >= data.Duration) {
          await Mute.deleteOne({ ID: data.ID })
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
          await member.send({ content: `**${guild.name}** sunucusunda aldığınız **METIN SUSTURULMA** cezanız sona erdi.` }).catch((err) => { });
          if (member.guild.settings.chatMuteRole) await member.roles.remove(member.guild.settings.chatMuteRole).catch((err) => { });
        } else {
          if (member && member.roles.cache.get(member.guild.settings.chatMuteRole)) await member.roles.add(member.guild.settings.chatMuteRole).catch((err) => { });
        }
      });
    }, 25000)

    setInterval(async () => {
      const vMute = await VoiceMute.find({})
      const guild = client.guilds.cache.get(client.system.serverID);
      vMute.forEach(async (data) => {
        const member = guild.members.cache.get(data.ID);
        if (!member && data.Duration && Date.now() >= data.Duration) {
          await VoiceMute.deleteOne({ ID: data.ID })
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
        }

        if (member && data.Duration && Date.now() >= data.Duration) {
          await VoiceMute.deleteOne({ ID: data.ID })
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
          if (member && member.voice.channel) await member.voice.setMute(false).catch(err => { });
          await member.send({ content: `**${guild.name}** sunucusunda aldığınız **SES SUSTURULMA** cezanız sona erdi.` }).catch((err) => { });
          if (member.guild.settings.voiceMuteRole) await member.roles.remove(member.guild.settings.voiceMuteRole).catch((err) => { });
        } else {
          if (member && member.voice.channel) await member.voice.setMute(true).catch(err => { });
          if (member && member.roles.cache.get(member.guild.settings.voiceMuteRole)) await member.roles.add(member.guild.settings.voiceMuteRole).catch((err) => { });
        }
      });
    }, 25000)

    setInterval(async () => {
      const Jails = await Jail.find({})
      const guild = client.guilds.cache.get(client.system.serverID);
      Jails.forEach(async (data) => {
        const member = guild.members.cache.get(data.ID);
        if (!member && data.Duration && Date.now() >= data.Duration) {
          await Jail.deleteOne({ ID: data.ID })
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
        }

        if (member && data.Duration && Date.now() >= data.Duration) {
          const Users = await User.findOne({ userID: member.id });
          await Jail.deleteOne({ ID: data.ID })
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
          await member.send({ content: `**${guild.name}** sunucusunda aldığınız **JAİL** cezanız sona erdi.` }).catch((err) => { });
          if (!member.guild.settings.taggedMode && Users && Users.userName && Users.Gender) {
            if (member && member.manageable) member.setNickname(`${member.user.displayName.includes(member.guild.settings.serverTag) ? "" : (member.guild.settings.secondTag || "")} ${Users.userName}`)
            if (Users.Gender == "Male") member.setRoles(member.guild.settings.manRoles)
            if (Users.Gender == "Girl") member.setRoles(member.guild.settings.womanRoles)
            if (Users.Gender == "Unregister") member.setRoles(member.guild.settings.unregisterRoles)
            if (member.user.displayName.includes(member.guild.settings.serverTag)) member.roles.add(member.guild.settings.familyRole)
          } else {
            if (member && member.manageable) await member.setNickname(`${member.user.displayName.includes(member.guild.settings.serverTag) ? "" : (member.guild.settings.secondTag || "")} İsim | Yaş`)
            member.setRoles(member.guild.settings.unregisterRoles)
          }
        } else {
          if (member && member.roles.cache.get(member.guild.settings.quarantineRole)) await member.setRoles(member.guild.settings.quarantineRole).catch((err) => { });
        }
      });
    }, 25000)

    setInterval(async () => {
      const eventPunish = await Punitive.find({ Type: 'Etkinlik Ceza', Active: true });
      const guild = client.guilds.cache.get(client.system.serverID);
      eventPunish.forEach(async (data) => {
        const member = guild.members.cache.get(data.Member);
        if (!member && data.Duration && Date.now() >= data.Duration) {
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
        }

        if (member && data.Duration && Date.now() >= data.Duration) {
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
          await member.send({ content: `**${guild.name}** sunucusunda aldığınız **ETKİNLİK CEZALI** cezanız sona erdi.` }).catch((err) => { });
          if (member.guild.settings.etRole) await member.roles.remove(member.guild.settings.etRole).catch((err) => { });
        } else {
          if (member && member.roles.cache.get(member.guild.settings.etRole)) await member.roles.add(member.guild.settings.etRole).catch((err) => { });
        }
      });
    }, 25000)

    setInterval(async () => {
      const streamerPunish = await Punitive.find({ Type: 'Streamer Ceza', Active: true });
      const guild = client.guilds.cache.get(client.system.serverID);
      streamerPunish.forEach(async (data) => {
        const member = guild.members.cache.get(data.Member);
        if (!member && data.Duration && Date.now() >= data.Duration) {
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
        }

        if (member && data.Duration && Date.now() >= data.Duration) {
          if (await Punitive.findOne({ No: data.No })) await Punitive.updateOne({ No: data.No }, { $set: { "Active": false, Expried: Date.now() } }, { upsert: true })
          await member.send({ content: `**${guild.name}** sunucusunda aldığınız **STREAMER CEZALI** cezanız sona erdi.` }).catch((err) => { });
          if (member.guild.settings.stRole) await member.roles.remove(member.guild.settings.stRole).catch((err) => { });
        } else {
          if (member && member.roles.cache.get(member.guild.settings.stRole)) await member.roles.add(member.guild.settings.stRole).catch((err) => { });
        }
      });
    }, 25000)

    async function LeaderBoard() {
      const guild = await client.guilds.fetch(client.system.serverID);
      if (!guild) return;

      const document = await Servers.findOne({ serverID: guild.id });
      if (!document) return;

      const channel = guild.channels.cache.get(document.leaderboard.channel);
      if (!channel) return;

      const messageBoard = await channel.messages.fetch(document.leaderboard.msg);
      const guildMembers = guild.members.cache.map(member => member.user.id);

      if (!messageBoard) return await Servers.findOneAndUpdate({ guildID: guild.id }, { $set: { leaderboard: {} } });

      const Message = await User.aggregate([
        { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Messages` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
        { $match: { userID: { $in: guildMembers }, total: { $gt: 0 } } },
        { $sort: { total: -1 } },
        { $skip: 0 },
        { $limit: 3 },
        { $project: { userID: 1, total: 1 } },
      ]);

      const Voice = await User.aggregate([
        { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Voices` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
        { $match: { userID: { $in: guildMembers }, total: { $gt: 0 } } },
        { $sort: { total: -1 } },
        { $skip: 0 },
        { $limit: 3 },
        { $project: { userID: 1, total: 1 } },
      ]);

      const Stream = await User.aggregate([
        { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Streams` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
        { $match: { userID: { $in: guildMembers }, total: { $gt: 0 } } },
        { $sort: { total: -1 } },
        { $skip: 0 },
        { $limit: 3 },
        { $project: { userID: 1, total: 1 } },
      ]);

      const Camera = await User.aggregate([
        { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Cameras` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
        { $match: { userID: { $in: guildMembers }, total: { $gt: 0 } } },
        { $sort: { total: -1 } },
        { $skip: 0 },
        { $limit: 3 },
        { $project: { userID: 1, total: 1 } },
      ]);

      const MessageArray = [];
      const VoiceArray = [];
      const StreamArray = [];
      const CameraArray = [];

      Message.forEach((data, index) => {
        MessageArray.push({ id: data.userID, total: data.total, i: index + 1 });
      });

      Voice.forEach((data, index) => {
        VoiceArray.push({ id: data.userID, total: data.total, i: index + 1 });
      });

      Stream.forEach((data, index) => {
        StreamArray.push({ id: data.userID, total: data.total, i: index + 1 });
      });

      Camera.forEach((data, index) => {
        CameraArray.push({ id: data.userID, total: data.total, i: index + 1 });
      });

      const embedMessage = new EmbedBuilder({
        color: client.random(),
        description: [
          `${client.getEmoji('point')} ${bold(`Aşağıda ${guild.name} sunucusunun sıralama tablosu listelenmektedir.`)}\n`,
          `${client.getEmoji('point')} **Ses Sıralaması:**\n${VoiceArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${formatDurations(data.total)}`).join('\n')}\n`,
          `${client.getEmoji('point')} **Mesaj Sıralaması:**\n${MessageArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${data.total} mesaj`).join('\n')}\n`,
          `${client.getEmoji('point')} **Yayın Sıralaması:**\n${StreamArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${formatDurations(data.total)}`).join('\n')}\n`,
          `${client.getEmoji('point')} **Kamera Sıralaması:**\n${CameraArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${formatDurations(data.total)}`).join('\n')}\n`,
          `${client.getEmoji('point')} **Sıralama Tablosu Saatlik Güncellenmektedir.**`,
        ].join('\n'),
      })

      try {
        messageBoard.edit({ embeds: [embedMessage] })
      } catch (e) {
        console.log(e)
      }
    }

    setInterval(async () => {
      const secretRooms = await SecretRoom.find({});
      secretRooms.forEach(async (room) => {
        const channel = client.channels.cache.get(room.id);
        if (channel && channel.members.size === 0) {
          await channel.delete().catch();
          await SecretRoom.deleteOne({ id: room.id }).catch();
        }
      });
    }, 30000);

    setInterval(async () => {
      await LeaderBoard()
    }, 3600000);
  }
};

function formatDurations(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let timeString = "";

  if (hours > 0) {
    const minutes2 = minutes % 60;
    timeString += hours + "," + (minutes2 < 10 ? "0" : "") + minutes2 + " saat";
  } else if (minutes > 0) {
    const seconds2 = seconds % 60;
    timeString += minutes + "," + (seconds2 < 10 ? "0" : "") + seconds2 + " dakika";
  } else {
    timeString += seconds + " saniye";
  }

  return timeString.trim();
}