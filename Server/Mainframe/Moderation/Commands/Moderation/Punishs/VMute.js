const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const getLimitMute = new Map()

module.exports = {
  Name: 'vmute',
  Aliases: ['v-mute', 'sessustur', 'kessesini', 'sesmute', 'ses-mute', 'voicemute'],
  Description: 'Belirlenen üyeyi ses kanallarında susturur.',
  Usage: 'vmute <@User/ID>',
  Category: 'Moderation',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    if (!message.guild.settings.voiceMuteAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
      message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
      return;
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if (!member) {
        message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        return;
    }

    if (message.author.id === member.id) {
        message.reply(global.cevaplar.kendi).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        return;
    }

    if (!member.manageable) {
        message.reply(global.cevaplar.dokunulmaz).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        return;
    }

    if (message.member.roles.highest.position <= member.roles.highest.position) {
        message.reply(global.cevaplar.yetkiust).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        return;
    }

    if (member.roles.cache.has(message.guild.settings.voiceMuteRole)) {
        message.reply(global.cevaplar.cezavar).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        return;
    }

    if (getLimitMute.get(message.author.id) >= message.guild.settings.vmuteLimit) {
        message.reply(global.cevaplar.limit).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        return;
    }

    const Punitives = [
      { label: "Küfür, hakaret söylemi, kışkırtmak", description: "10 Dakika", emoji: { id: "1265260101284003874" }, value: "1", time: "10m" },
      { label: "Ses değiştirici veya soundpad troll", description: "15 Dakika", emoji: { id: "1265260101284003874" }, value: "2", time: "15m" },
      { label: "Ailevi değerlere küfür", description: "20 Dakika", emoji: { id: "1265260101284003874" }, value: "3", time: "20m" },
      { label: "Siyasi tartışmalar yapmak", description: "30 Dakika", emoji: { id: "1265260101284003874" }, value: "4", time: "30m" },
      { label: "Sunucu kötülemek veya Sunucu ismi vermek", description: "30 Dakika", emoji: { id: "1265260101284003874" }, value: "5", time: "30m" },
      { label: "Cinsellik içeren konuşmalar veya benzetmeler yapmak", description: "30 Dakika", emoji: { id: "1265260101284003874" }, value: "6", time: "30m" },
    ];

    const PunitiveMenu = new ActionRowBuilder().setComponents(new StringSelectMenuBuilder().setCustomId("cezalar2").setPlaceholder("Ses kanalları cezaları").setOptions(Punitives));
    let msg = await message.channel.send({ embeds: [new global.VanteEmbed().setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }).setDescription(`Aşağıda bulunan menüden ses kanallarından susturmak istediğiniz ${member} için uygun olan ceza sebebini ve süresini seçiniz!`)], components: [PunitiveMenu] })
    const collector = msg.createMessageComponentCollector({ filter: (menu) => menu.user.id === message.member.id, time: 60000 });

    collector.on("collect", async (menu) => {
      for (let i = 0; i < Punitives.length; i++) {
        const Penal = Punitives[i];
        if (Penal.value === menu.values[0]) {
          if (Number(message.guild.settings.vmuteLimit)) {
            if (!message.member.permissions.has(Flags.Administrator) && !message.guild.settings.ownerRoles.some(ertumharikasinbe => message.member.roles.cache.has(ertumharikasinbe))) {
              getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) + 1)
              setTimeout(() => {
                getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) - 1)
              }, 1000 * 60 * 5)
            }
          }
          message.react(`${client.getEmoji("check")}`)
          await member.Punitive(message.member, "VOICE-MUTE", Penal.label, message.channel, Penal.time, msg);
        }
      }
    })
  },
};