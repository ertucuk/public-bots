const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'coinflip',
    Aliases: ['cf'],
    Description: 'Para döndürür için kullanılır.',
    Usage: 'coinflip <100-50000-all>',
    Category: 'Economy',
    Cooldown: 10,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        if (data.Inventory == null) {
            data.Inventory = {
                Cash: 0,
            }
            await data.save()
        }
        let amount = Number(args[0])
        if (args[0] == 'all') {
            if (data.Inventory.Cash >= 500000) amount = 500000
            if (data.Inventory.Cash < 500000) amount = data.Inventory.Cash
            if (data.Inventory.Cash <= 0) amount = 10
        }

        if (isNaN(amount)) {
            message.reply({ content: 'Lütfen geçerli bir miktar giriniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (amount <= 0) {
            message.reply({ content: 'Belirttiğiniz miktar geçersizdir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (amount > 500000) {
            message.reply({ content: 'Maksimum miktar 500.000$ olabilir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (amount > data.Inventory.Cash) {
            message.reply({ content: 'Yeterli paranız bulunmamaktadır.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (amount < 10) {
            message.reply({ content: 'Minimum bahis 10$ olabilir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        data.Inventory.Cash -= Number(amount)
        data.markModified('Inventory')

        let winAmount = Number(amount * 2)
        winAmount = winAmount.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
        const msg = await message.channel.send({ content: `**${winAmount}$** için bahis döndürülüyor!...` })
        setTimeout(async () => {
            let rnd = Math.floor(Math.random() * 2),
                result
            if (rnd == 1) {
                result = 'kazandın'
                data.Inventory.Cash += Number(amount * 2)
                data.markModified('Inventory')
            } else result = 'kaybettin'
            msg.edit({ content: `**${winAmount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}** için bahis döndürülme durdu ve ${result}!` })
            data.save()
        }, 4000)
    },
};
