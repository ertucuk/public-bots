const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { Staff } = require('../../../../Global/Settings/Schemas')
const Staffs = require('../../../../Global/Base/Staff')
const newStaff = require('./Utils/newStaff')
const isStaff = require('./Utils/isStaff')

module.exports = {
  Name: 'yetkibaşlat',
  Aliases: ['takestaff', 'yetkilial', 'alyetkili', 'yetkili', 'stafftake', 'yetkiver', 'yetkibaşlat', 'yetki'],
  Description: 'Yetkili almanızı sağlar.',
  Usage: 'yetkibaşlat <@User/ID>',
  Category: 'Auth',
  Cooldown: 0,
  Command: { Prefix: true },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }
    
    if (!message.guild.settings.staffs.some((r) => message.member.roles.cache.has(r)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
      message.reply(global.cevaplar.noyt).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if (!member) {
      message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    if (member.user.bot) {
      message.reply(global.cevaplar.bot).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    } 

    if (member.id === message.author.id) {
      message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }
    
    if (!(await Staffs.checkStaff(member)) && !(await Staffs.checkPointStaff(member))) newStaff(client, message, member)
    else {
      if (!message.member.roles.cache.has(message.guild.settings.authLeader) && !message.member.roles.cache.has(message.guild.settings.authController) && !message.member.roles.cache.has(message.guild.settings.authResponsible) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
        message.channel.send({ content: `${client.getEmoji('mark')} Yetkili yükseltim için gerekli yetkin bulunmamaktadır.` })
        return
      }
      isStaff(client, message, member)
    }
  },
};