const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Punitive, User, ForceBan, Mute, VoiceMute, Jail, Ads } = require('../../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'af',
  Aliases: ['cezaaf',],
  Description: 'Belirlenen üyenin cezalarını kaldırır.',
  Usage: 'af <@User/ID>',
  Category: 'Moderation',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {

    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu kullanmaya yetkiniz yok.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    } 

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if (!member) {
      message.reply(global.cevaplar.üyeyok).then(x => { setTimeout(() => { x.delete() }, 5000) })
      return;
    } 

    if (message.author.id === member.id) {
      message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
      return;
    }

    const punitivesData = await Punitive.find({ Member: member.id });
    if (!punitivesData.length) {
      message.reply(global.cevaplar.cezayok).then(x => { setTimeout(() => { x.delete() }, 5000) })
      return;
    }

    const reverseData = punitivesData.reverse();
    const filteredData = reverseData.filter(data => data.Active == true);

    if (!filteredData.length) {
      message.reply(global.cevaplar.cezayok).then(x => { setTimeout(() => { x.delete() }, 5000) })
      return;
    }

    const options = filteredData.map((data, index) => {
      return {
        label: `${index + 1} - [${data.Type}]`,
        description: `Sebep: ${data.Reason}`,
        value: data.No.toString(),
        author: message.guild.members.cache.get(data.Staff) ? message.guild.members.cache.get(data.Staff).user : 'Bilinmiyor',
        reason: data.Reason,
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('amnesty')
      .setPlaceholder('Bir ceza seçin...')
      .addOptions(options);

    const list = options.map((option) => {
      return `${option.label} ${option.author}: ${option.reason}`;
    }).join('\n');

    const embed = new EmbedBuilder({
      author: { name: member.user.username, icon_url: member.user.displayAvatarURL({ dynamic: true }) },
      footer: { text: message.guild.name, icon_url: message.guild.iconURL({ dynamic: true }) },
      description: `${member.user} adlı üyenin aktif cezaları aşağıda listelenmiştir.\n\n${list}`,
    })

    const msg = await message.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(selectMenu)],
    });

    const filter = (i) => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async (i) => {
      i.deferUpdate();
      const data = options.find((option) => option.value === i.values[0]);

      if (data) {
        const punitiveData = await Punitive.findOne({ No: data.value });
        if (!punitiveData) return;

        const update = { "Active": false, Expried: Date.now(), Remover: message.member.id };

        if (punitiveData.Type === 'Cezalandırılma') {
          await Jail.deleteOne({ No: punitiveData.No });
        } else if (punitiveData.Type === 'Reklam') {
          await Ads.deleteOne({ No: punitiveData.No });
        } else if (punitiveData.Type === 'Metin Susturulma') {
          member.roles.remove(message.guild.settings.chatMuteRole);
          await Mute.deleteOne({ No: punitiveData.No });
        } else if (punitiveData.Type === 'Ses Susturulma') {
          if (member.voice.channel) member.voice.setMute(false);
          member.roles.remove(message.guild.settings.voiceMuteRole);
          await VoiceMute.deleteOne({ No: punitiveData.No });
        } else if (punitiveData.Type === 'Streamer Ceza') {
          member.roles.remove(message.guild.settings.stRole);
        } else if (punitiveData.Type === 'Etkinlik Ceza') {
          member.roles.remove(message.guild.settings.etRole);
        }

        await Punitive.updateOne({ No: punitiveData.No }, { $set: update });

        await msg.edit({
          components: msg.components.map(row =>
            new ActionRowBuilder().addComponents(
              row.components.map(component => {
                if (component.type === 3) {
                  return new StringSelectMenuBuilder()
                    .setCustomId(component.customId)
                    .setPlaceholder('Başarılı bir şekilde ceza affedildi.')
                    .setDisabled(true)
                    .addOptions(component.options);
                }

                return component;
              })
            )
          )
        });

        if (punitiveData.Type === 'Metin Susturulma' || punitiveData.Type === 'Ses Susturulma' || punitiveData.Type === 'Streamer Ceza' || punitiveData.Type === 'Etkinlik Ceza') return;
        const Users = await User.findOne({ userID: member.id })
        if (!message.guild.settings.taggedMode && Users && Users.userName && Users.Gender) {
          if (member && member.manageable) {
            if (message.guild.settings.public) {
              member.setNickname(`${member.user.displayName.includes(message.guild.settings.serverTag) ? `${message.guild.settings.serverTag}` : (message.guild.settings.secondTag || "")} ${Users.userName}`)
            } else {
              member.setNickname(`${message.guild.settings.secondTag} ${Users.userName}`).catch();
            }
          }
          if (Users.Gender == "Male") member.setRoles(message.guild.settings.manRoles)
          if (Users.Gender == "Girl") member.setRoles(message.guild.settings.womanRoles)
          if (Users.Gender == "Unregister") member.setRoles(message.guild.settings.unregisterRoles)
          if (message.guild.settings.public) {
            if (member.user.displayName.includes(message.guild.settings.serverTag)) member.roles.add(message.guild.settings.familyRole)
          }
        } else {
          if (member && member.manageable) {
            if (message.guild.settings.public) {
              member.setNickname(`${member.user.displayName.includes(message.guild.settings.serverTag) ? `${message.guild.settings.serverTag}` : (message.guild.settings.secondTag || "")} İsim | Yaş`)
            } else {
              member.setNickname(`${message.guild.settings.secondTag} İsim | Yaş`).catch();
            }
          }
          member.setRoles(message.guild.settings.unregisterRoles)
        }
      }
    });
  },
};