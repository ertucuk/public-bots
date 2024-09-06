const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'parayükle',
    Aliases: ['parayukle', 'paraekle'],
    Description: 'Bir üyeye dilediğiniz miktarda para gönderirsiniz.',
    Usage: 'parayükle <üye> <miktar>',
    Category: 'Root',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.bot).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        if (isNaN(args[1])) {
            message.reply({ content: 'Lütfen geçerli bir miktar giriniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (args[1] <= 0) {
            message.reply({ content: 'Belirttiğiniz miktar geçersizdir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        const data = (await User.findOne({ userID: member.id })) || new User({ userID: member.id }).save();
        data.Inventory.Cash += Number(args[1])
        data.markModified('Inventory')
        await data.save()
        message.reply({ content: `Başarıyla ${member.user} kullanıcısına **${numberWithCommas(args[1])}$** yüklediniz.` })
    },
};

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}