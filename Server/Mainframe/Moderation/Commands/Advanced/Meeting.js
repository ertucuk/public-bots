const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js'); 

module.exports = {
    Name: 'toplantı',
    Aliases: ['meeting', 'toplanti', 'katıldı', 'katildi'],
    Description: 'Toplantıdaki üyelere katıldı rolü verir.',
    Usage: 'toplantı',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
        message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => {}), 5000))
        return;
    }
    
    const channel = message.member.voice.channel;
    if (!channel) {
        message.reply({ content: `${client.getEmoji("mark")} Bir ses kanalında olmanız gerekiyor.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
        return;
    }

    const members = channel.members.filter((m) => !m.user.bot);
    if (!members.size) {
        message.reply({ content: `${client.getEmoji("mark")} Kanalda bulunan kullanıcı sayısı 0 olduğu için işlem iptal edildi.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
        return;
    }

    const meetingRoleControl = message.guild.members.cache.filter((m) => m.roles.cache.has(message.guild.settings.meetingRole));
    meetingRoleControl.forEach((m) => m.roles.remove(message.guild.settings.meetingRole));
   
    const unjoinedMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(message.guild.settings.meetingRole) && m.voice.channelId && m.voice.channelId === channel.id);
    unjoinedMembers.forEach((m) => m.roles.remove(message.guild.settings.meetingRole));
    
    const staffControl = members.filter((m) => message.guild.settings.staffs.some((r) => m.roles.cache.has(r)));
    staffControl.forEach((m) => m.roles.add(message.guild.settings.meetingRole));

    message.channel.send({ content: `${client.getEmoji("check")} Başarıyla kanaldaki tüm kullanıcılara katıldı rolü verildi.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 15000));
  }, 
};