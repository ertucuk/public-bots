const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, bold } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'davet',
  Aliases: ['inv', 'invite', 'davetlerim', 'invites', 'davetim'],
  Description: 'Kullanıcının davetlerine bakarsınız.',
  Usage: 'davet <@User/ID>',
  Category: 'Stat',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

    const member = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.member;
    if (!member) return message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
    if (member.bot) return message.reply(global.cevaplar.bot).then((e) => setTimeout(() => { e.delete(); }, 10000));

    const document = await User.findOne({ userID: member.id });
    if (!document) {
      message.reply({ content: `Belirttiğin kullanıcının verisi bulunmuyor.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    const invitingUsers = await User.find({ UserInviter: member.id });
    const dailyTotal = invitingUsers.filter((inv) => message.guild.members.cache.has(inv.userID) && 1000 * 60 * 60 * 24 >= Date.now() - message.guild.members.cache.get(inv.userID).joinedTimestamp).length;
    const weeklyTotal = invitingUsers.filter((inv) => message.guild.members.cache.has(inv.userID) && 1000 * 60 * 60 * 24 * 7 >= Date.now() - message.guild.members.cache.get(inv.userID).joinedTimestamp).length;

    const embed = new EmbedBuilder({
      color: client.random(),
      author: { name: member.username, iconURL: member.displayAvatarURL({ forceStatic: true }) },
      description: `Toplam ${bold(document.NormalInvites)} daveti bulunuyor. (${bold(document.NormalInvites)} normal, ${bold(document.LeaveInvites)} ayrılan, ${bold(dailyTotal)} günlük, ${bold(weeklyTotal)} haftalık)`,
    })

    message.channel.send({ embeds: [embed] });
  },
};
