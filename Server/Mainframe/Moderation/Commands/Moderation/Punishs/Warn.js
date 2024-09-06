const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Punitive, User, Jail } = require('../../../../../Global/Settings/Schemas');
module.exports = {
  Name: 'uyar',
  Aliases: ['warn'],
  Description: 'Belirlenen üyeyi uyarır.',
  Usage: 'uyar <@User/ID>',
  Category: 'Moderation',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {

    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark'  )} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    if (!message.guild.settings.staffs.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
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

    const reason = args.splice(1).join(" ") || "Sebep Belirtilmedi."
    if (!reason) {
      message.reply(global.cevaplar.sebep).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
      return;
    }

    message.react(`${client.getEmoji("check")}`)
    member.Punitive(message.member, "WARN", reason, message.channel);

    const warnsCount = await Punitive.find({ Member: member.id, Type: "Uyarılma" });
    if (warnsCount >= 5) {
      await Punitive.deleteMany({ Member: member.id, Type: "Uyarılma" });
      member.timeout(1000 * 60 * 60 * 24);
      member.send({ content: `Sunucuda 5 uyarı aldığınız için 1 gün boyunca susturuldunuz. Eğer bir şikayetiniz varsa yetkililere ulaşabilirsiniz.` }).catch(err => { });
      message.channel.send({ content: `${member.toString()} isimli üye sunucuda 5 uyarı aldığı için 1 gün boyunca susturuldu.` }).catch(err => { });
    }
  },
};