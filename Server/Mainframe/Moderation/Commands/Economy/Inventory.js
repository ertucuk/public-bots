const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'envanter',
    Aliases: ['inventory', 'çanta'],
    Description: 'Çanta içeriğinizi gösterir.',
    Usage: 'envanter',
    Category: 'General',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const document = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        const inventory = document.Inventory

        const embed = new EmbedBuilder({
            color: client.random(),
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() },
            description: [
                `**${message.author.username}** adlı kullanıcının çantası;\n`,
                `Bakiye: ${inventory.Cash}$`,
                `Pırlanta Yüzük: ${String(inventory.ring1 || 0)}`,
                `Baget Yüzük: ${String(inventory.ring2 || 0)}`,
                `Tektaş Yüzük: ${String(inventory.ring3 || 0)}`,
                `Tria Yüzük: ${String(inventory.ring4 || 0)}`,
                `Beştaş Yüzük: ${String(inventory.ring5 || 0)}`,
            ].join('\n'),
        })

        message.reply({ embeds: [embed] })
    },
};
