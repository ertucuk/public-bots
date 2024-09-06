const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'daily',
    Aliases: ['günlük'],
    Description: 'Günlük ödülünüzü alırsınız.',
    Usage: 'günlük',
    Category: 'Economy',
    Cooldown: 86400,
    Command: { Prefix: true }, 

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        let Daily = Math.random()
        Daily = Daily * (5000 - 100)
        Daily = Math.floor(Daily) + 100
    
        await message.reply({ content: `Başarıyla günlük ödülünüzü alarak **${Daily}$** kazandınız.` })
        await User.updateOne({ userID: message.author.id }, { $inc: { 'Inventory.Cash': Daily } }, { upsert: true })
    },
};
