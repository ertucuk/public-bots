const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, bold } = require('discord.js');
const { Punitive, User } = require('../../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'cezapuan',
  Aliases: ['cp'],
  Description: 'Belirtilen üyenin ceza puanını gösterir.',
  Usage: 'cezapuan <@User/ID>',
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

        if (!message.guild.settings.staffs.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const data = await User.findOne({ userID: member.id });
        if (!data) {
            message.reply({ content: 'Belirtilen üyenin herhangi bir verisi bulunamadı.' });
            return;
        }

        message.channel.send({
            content: `${member} üyesinin toplam ceza puanı: ${bold(data ? data.PenalPoints : 0)}`
        });
    },
};