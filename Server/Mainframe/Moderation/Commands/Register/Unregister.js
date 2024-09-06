const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, enableValidators } = require('discord.js');
const Limit = new Map();
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'kayıtsız',
  Aliases: ['kayitsiz', "ks", "unregister", "unregistered", "kayitsizyap"],
  Description: 'Belirlenen üyeyi kayıtsıza atar.',
  Usage: 'kayıtsız <@User/ID>',
  Category: 'Register',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.registerAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
    if (!message.guild.settings.registerSystem) return message.reply({ content: `${client.getEmoji("mark")} Bu sunucuda kayıt sistemi devre dışı bırakılmış.` });
    if (Limit.get(message.author.id) >= message.guild.settings.unregisteredLimit) return message.reply(`Kayıtsıza atma limitine ulaştınız.`).then(s => setTimeout(() => s.delete().catch(err => { }), 7500));
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
    if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
    if (!member.manageable) return message.reply(global.cevaplar.dokunulmaz).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
    if (message.guild.settings.unregisterRoles.some(x => member.roles.cache.has(x))) return message.reply(global.cevaplar.kayıtsız).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
    if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply(global.cevaplar.yetkiust).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })

    member.Unregister(message.member, "Kayıtsıza Atıldı", message.channel)

    if (Number(message.guild.settings.unregisteredLimit) && message.guild.settings.unregisteredLimit > 1) {
      if (!message.member.permissions.has(Flags.Administrator) && !message.guild.settings.ownerRoles.some(e => message.member.roles.cache.has(e))) {
        Limit.set(`${message.member.id}`, (Number(Limit.get(`${message.member.id}`) || 0)) + 1)
        setTimeout(() => {
          Limit.set(`${message.member.id}`, (Number(Limit.get(`${message.member.id}`) || 0)) - 1)
        }, 1000 * 60 * 5)
      }
    }
  },
};