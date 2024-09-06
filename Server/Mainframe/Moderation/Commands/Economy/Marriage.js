const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, bold } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'evlilik',
    Aliases: ['kocam', 'karım', 'karim', 'sevgilim', 'manitam'],
    Description: 'Evlendiginiz kisiyi gosterir.',
    Usage: 'evlilik',
    Category: 'General',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        const marriage = data.Marriage
        if (data.Inventory == null) {
            data.Inventory = { Cash: 0 }
            await data.save()
        }

        if (marriage.active === false) {
            message.reply({ content: `${client.getEmoji('mark')} Evli değilsiniz.` }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        const user = await client.users.fetch(marriage.married)
        const ring = marriage.ring
        const date = client.timestamp(marriage.date)

        let thumbnailURL;
        let description;

        if (ring === 1) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334384558110'
            description = 'Pırlanta'
        } else if (ring === 2) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334036693004'
            description = 'Baget'
        } else if (ring === 3) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393334003138570'
            description = 'Tektaş'
        } else if (ring === 4) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393335819272203.gif'
            description = 'Tria'
        } else if (ring === 5) {
            thumbnailURL = 'https://cdn.discordapp.com/emojis/590393335915479040.gif'
            description = 'Beştaş'
        }

        const embed = new EmbedBuilder({
            author: { name: `${message.author.username}, ${user.username} ile evlisiniz!` },
            timestamp: new Date(),
            thumbnail: { url: thumbnailURL },
            footer: { text: description + ' Yüzük', iconURL: thumbnailURL },
            description: `${date} tarihinden beri evlisiniz! ${bold(description)} yüzüğünüzle mutluluğunuz daim olsun!`
        })

        message.reply({ embeds: [embed] })
    },
};