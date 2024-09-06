const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { Punitive } = require('../../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'ceza',
  Aliases: ['cezabilgi'],
  Description: 'Belirtilen ceza numarasının bütün bilgilerini gösterir.',
  Usage: 'ceza <#Ceza-No>',
  Category: 'Moderation',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    if (isNaN(args[0])) {
      message.reply({ content: `${client.getEmoji("mark")} **Hatalı!** Lütfen Doğru Ceza Numarası Giriniz.` }).then((e) => setTimeout(() => { e.delete(); }, 5000));
      return;
    }

    const document = await Punitive.findOne({ No: args[0] })
    if (!document) {
      message.reply({ content: `${client.getEmoji("mark")} **Hatalı!** Belirtilen Ceza Numarası Bulunamadı.` }).then((e) => setTimeout(() => { e.delete(); }, 5000));
      return;
    }
    
    const member = await client.getUser(document.Member);
    const auth = await client.getUser(document.Staff);

    const embed = new global.VanteEmbed()
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 2048 }))
      .setDescription(`**#${args[0]}** ID'li **${document.Active ? 'aktif' : 'pasif'}** cezanın detayları aşağıda yer almaktadır.`)
      .addFields(
        { name: 'İşlem Uygulayan Yetkili', value: `${auth}`, inline: true },
        { name: 'İşlem Tipi', value: `${document.Type}`, inline: true },
        { name: 'İşlem Sebebi', value: document.Reason ? `${document.Reason.length > 1024 ? document.Reason.substring(0, 1022).trim() + '..' : document.Reason}` : 'Sebep belirtilmemiş.', inline: false },
        { name: 'Süre Bilgileri', value: `İşlem <t:${Math.floor(document.Date / 1000)}> tarihinde (<t:${Math.floor(document.Date / 1000)}:R>) uygulanmış. \n\n${document.Expried ? `Verilen ceza <t:${Math.floor(document.Expried / 1000)}> tarihinde (<t:${Math.floor(document.Expried / 1000)}:R>) sona ${document.Active ? 'erecek' : 'ermiş'}.` : ''}`, inline: false }
      );

    if (member) {
      embed.setAuthor({ iconURL: member.displayAvatarURL({ dynamic: true }), name: `Cezalı: ${member.username}` })
    } else {
      embed.setAuthor({ iconURL: message.guild.iconURL({ dynamic: true }), name: `Cezalı: Bilinmiyor.` })
    }

    message.channel.send({ embeds: [embed] })
  },
};