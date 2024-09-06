const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ChannelType } = require('discord.js'); 

module.exports = {
    Name: 'dağıt',
    Aliases: ['dagıt', 'distribute'],
    Description: 'Bulunduğunuz ses kanalındaki üyeleri public odalara dağıtmaya yarar.',
    Usage: 'dağıt',
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

    if (!message.member.voice.channel) {
        message.reply({ content: `${client.getEmoji("mark")} Bir ses kanalında olmanız gerekiyor.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
        return;
    }

    const publicCategory = message.guild.channels.cache.filter((c) => c.parentId === message.guild.settings.publicParent && c.type === ChannelType.GuildVoice);

    [...message.member.voice.channel.members.values()]
    .filter((m) => m.voice.channelId === message.member.voice.channelId)
    .forEach((m) => m.voice.setChannel(publicCategory.random().id));

    message.react(client.getEmoji("check"));
    message.channel.send({ content: `${client.getEmoji("check")} Başarıyla kanaldaki tüm kullanıcılar public odalara dağıtıldı.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 15000));
   }, 
};