const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'coin',
    Aliases: ['para', 'c', 'money', 'cash'],
    Description: 'Sunucudaki Paranızı Gösterir.',
    Usage: 'coin',
    Category: 'Economy',
    Cooldown: 10,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        if (data.Inventory == null) {
            data.Inventory = {
                Cash: 0,
            }
            await data.save()
        }
        message.reply({ content: `Bankanızda **${numberWithCommas(data.Inventory.Cash || 0)}$** bulunmaktadır.` })
    },
};

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}