const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    Name: 'reroll',
    Aliases: ['greroll'],
    Description: 'Çekilişte kazananı yeniden belirler',
    Usage: 'reroll [Mesaj ID]',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const messageID = args[0];
        if (!messageID) return message.reply({ content: `${client.getEmoji("mark")} Lütfen bir çekiliş ID'si belirtin.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        client.giveawaysManager.reroll(messageID, {
            messages: {
                congrat: ':tada: Yeni kazanan(lar): {winners}! Tebrikler, **{this.prize}** kazandınız!',
                error: 'Geçerli katılım yok, yeni kazanan seçilemiyor!'
            }
        });
    },
};