const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, Collection, bold } = require('discord.js');
const moment = require("moment");
moment.locale("tr");
const InviteRegExp = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;

module.exports = {
  Name: 'afk',
  Aliases: ['afk'],
  Description: 'Afk iseniz bu komutu girdiğinizde sizi etiketleyenlere sizin klavye başında olmadığınızı açıklar.',
  Usage: 'afk [sebep]',
  Category: 'Global',
  Cooldown: 0,
  Command: { Prefix: true },

  messageRun: async (client, message, args) => {

    const reason = args.join(' ') || `Şu anda meşgulüm, yakın bir zamanda geri döneceğim!`;
    if (InviteRegExp.test(reason) || message.mentions.everyone) return message.delete()

    const document = client.afks.get(message.author.id)
    if (document) {
      const embed = new EmbedBuilder().setDescription(
        `${message.author}, AFK modundasınız. **${moment
          .duration(Date.now() - document.timestamp)
          .format(
            'd [gün], H [saat], m [dakika], s [saniye]'
          )}** boyunca AFK kaldınız. AFK modundan çıkmak için normal bir mesaj yazabilirsiniz.`
      )

      if (document.mentions.length) {
        embed.addFields([
          {
            name: 'Sen yokken seni etiketleyen kullanıcılar',
            value: document.mentions.map((m) => `${userMention(m.user)} (${time(m.timestamp)})`).join('\n')
          }
        ])
      }

      message.channel
        .send({ embeds: [embed] })
        .then((msg) => setTimeout(() => msg.delete(), 10000))
        .catch(() => { })
      return
    }

    client.afks.set(message.author.id, {
      reason: reason.length > 0 ? reason.slice(0, 2000) : null,
      timestamp: Date.now(),
      mentions: []
    })

    const newName = `[AFK] ${message.member.displayName}`
    if (!message.member.displayName.startsWith('[AFK]') && 32 > newName.length) message.member.setNickname(newName).catch(() => { })
    message.channel.send({ content: `${client.getEmoji('check')} Başarıyla afk moduna girdiniz! Bir şey yazana kadar ${bold('AFK')} kalacaksınız.` }).then((msg) => setTimeout(() => msg.delete(), 10000)).catch(() => { })
  },
};