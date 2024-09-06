const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, bold } = require('discord.js'); 

module.exports = {
    Name: 'sil',
    Aliases: ['clear', 'temizle'],
    Description: 'Kanalda belirtilen sayıda mesaj siler.',
    Usage: 'sil',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
        message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
        return;
    }
    
    const amount = args[0];
    if (!amount || isNaN(amount)) return message.reply({ content: `${client.getEmoji("mark")} Bir sayı belirtmelisin.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if (amount < 1 || amount > 100) return message.reply({ content: `${client.getEmoji("mark")} 1 ile 100 arasında bir sayı belirtmelisin.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    message.channel.bulkDelete(amount).catch(err => { });
    message.channel.send({ content: `${client.getEmoji("check")} Başarıyla ${bold(amount)} adet mesaj silindi.` }).then(s => setTimeout(() => s.delete().catch(err => {}), 15000));
   }, 
};