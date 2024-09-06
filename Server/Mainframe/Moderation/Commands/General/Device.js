const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'device',
    Aliases: ['cihaz'],
    Description: 'Kullanıcının cihaz bilgisini gösterir.',
    Usage: 'cihaz <Kullanıcı>',
    Category: 'General',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const device = member.presence?.clientStatus?.desktop ? 'Bilgisayar' : member.presence?.clientStatus?.mobile ? 'Mobil' : member.presence?.clientStatus?.web ? 'Web' : 'Bilinmiyor';
        message.reply({
            embeds: [
                new EmbedBuilder({
                    color: client.random(),
                    author: { name: member.user.username, iconURL: member.user.displayAvatarURL() },
                    description: `**${member.user.username}** kullanıcısı şu anda **${device}** cihazından bağlı.`
                })
            ]
        });
    },
};