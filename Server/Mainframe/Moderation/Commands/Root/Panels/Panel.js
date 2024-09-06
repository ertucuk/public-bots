const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 

module.exports = {
    Name: 'userpanel',
    Aliases: ['userpanel', 'kullanıcıpanel'],
    Description: 'Userpaneli gösterir.',
    Usage: 'userpanel',
    Category: 'Root',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const rowOne = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('userPanel-I')
              .setLabel(' \u200B \u200B I \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('userPanel-II')
              .setLabel(' \u200B \u200B II \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('userPanel-III')
              .setLabel(' \u200B \u200B III \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary)
          )
      
          const rowTwo = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('userPanel-IV')
              .setLabel(' \u200B \u200B IV \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('userPanel-V')
              .setLabel(' \u200B \u200B V \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('userPanel-VI')
              .setLabel(' \u200B \u200B VI \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary)
          )
      
          const rowThree = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('userPanel-VII')
              .setLabel(' \u200B \u200B VII \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('userPanel-VIII')
              .setLabel(' \u200B VIII \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('userPanel-IX')
              .setLabel(' \u200B \u200B IX \u200B \u200B ')
              .setStyle(ButtonStyle.Secondary)
          )

        if (message) message.delete().catch(() => {});
        message.channel.send({
            content: `### Merhaba **__${message.guild.name}__** kullanıcı paneline hoşgeldiniz.
Sunucu içerisi yapmak istediğiniz işlem veya ulaşmak istediğiniz bilgi için gerekli butonlara tıklamanız yeterli olucaktır!
            
**1:** \`Sunucuya giriş tarihinizi öğrenin.\`
**2:** \`Hesabınızın açılış tarihini öğrenin.\`
**3:** \`Üstünüzde bulunan rollerin listesini alın.\`

**4:** \`Davet bilgilerinizi öğrenin.\`
**5:** \`Devam eden cezanız (varsa) hakkında bilgi alın.\`
**6:** \`Geçmiş cezalarınızı öğrenin.\`

**7:** \`İsim değiştirme. (Sadece booster)\`
**8:** \`Sunucudaki eski isim bilgilerinizi görüntüleyin.\`
**9:** \`Sunucudaki ses ve mesaj bilgilerinizi görüntüleyin.\``,
            components: [rowOne, rowTwo, rowThree],
        });
    }
};