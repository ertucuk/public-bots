const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, bold } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'boşan',
    Aliases: ['divorce'],
    Description: 'Evliliğinizi boşarsınız.',
    Usage: 'boşan',
    Category: 'General',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        if (data.Marriage.active === false) {
            message.reply({ content: `${client.getEmoji('mark')} Zaten evli değilsiniz.` }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (data.Inventory == null) {
            data.Inventory = { Cash: 0 }
            await data.save()
        }

        const userData = await User.findOne({ userID: data.Marriage.married })
        if (userData.userID === '136619876407050240') {
            message.reply({ content: 'Ertuyla boşanamazsın.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        data.Marriage.active = false;
        data.Marriage.married = '';
        data.Marriage.date = '';
        data.Marriage.ring = '';
        data.markModified('Marriage');
        await data.save();

        if (userData) {
            userData.Marriage.active = false
            userData.Marriage.married = ''
            userData.Marriage.date = ''
            userData.Marriage.ring = ''
            userData.markModified('Marriage')
            await userData.save()
        }

        message.reply({ content: `${client.getEmoji('check')} Başarıyla boşandınız!` })
    },
};
