const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, inlineCode, EmbedBuilder, bold } = require('discord.js');
const { Staff } = require('../../../../Global/Settings/Schemas')
const Staffs = require('../../../../Global/Base/Staff');

module.exports = {
  Name: 'puan',
  Aliases: ['p', 'point'],
  Description: 'Yetkili puanınızı gösterir.',
  Usage: 'puan <@User/ID>',
  Category: 'Auth',
  Cooldown: 0,
  Command: { Prefix: true },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    if (!member) {
      message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && member.id !== message.author.id) {
      message.reply({ content: `${client.getEmoji('mark')} Başka bir üyenin puanını görmek için yetkiniz bulunmuyor.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }
   
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !message.guild.settings.minStaffs.some((r) => message.member.roles.cache.has(r)) && !message.guild.settings.mediumStaffs.some((r) => message.member.roles.cache.has(r))) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece alt ve orta yetkililer kullanabilir.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    const staffControl = await Staffs.checkPointStaff(member);
    if (!staffControl) {
      message.reply({ content: `${client.getEmoji('mark')} Bu üye yetkili değil.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    const { newRole, currentRole } = await Staffs.getPointRank(member.roles.cache.map((r) => r.id))
    const document = await Staff.findOne({ id: member.id }) || new Staff({ id: member.id }).save();
    if (!document) {
      message.reply({ content: `${client.getEmoji('mark')} Bir hata meydana geldi.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    let page = 1;
    const embed = buildEmbed(client, member, document, newRole, currentRole, page);
    message.reply({ embeds: [embed] });
  },
};

function buildEmbed(client, member, document, newRole, role, page) {
  if (page === 1) {
    return new EmbedBuilder({
      thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
      description: [
        `${client.getEmoji('point')} ${member} adlı yetkilinin puan bilgileri;\n`,
        `${client.getEmoji('point')} ${inlineCode(' Toplam Puan     :')} **${document?.totalPoints}** (%${calculatePercentage(document?.totalPoints, role.POINT)})`,
        `${client.getEmoji('point')} ${inlineCode(' Rol Sırası      :')} **${role.POSITION}. ROL**`,
        `${client.getEmoji('point')} ${inlineCode(' Rol             :')} <@&${role.ROLE}>`,
        `${client.getEmoji('point')} ${inlineCode(' Yetki Başlama   :')} ${client.timestamp(document?.roleStarted)}\n`,
        `${client.getEmoji('exclamation')} ${bold('PUANLAR')}\n`,
        `${client.getEmoji('point')} ${inlineCode(' BONUS PUAN      : ')} ${bold(document?.bonusPoints.toString())} (%${calculatePercentage(document?.bonusPoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' DAVET PUAN      : ')} ${bold(document?.invitePoints.toString())} (%${calculatePercentage(document?.invitePoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' MESAJ PUAN      : ')} ${bold(document?.messagePoints.toString())} (%${calculatePercentage(document?.messagePoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' PUBLIC PUAN     : ')} ${bold(document?.publicPoints.toString())} (%${calculatePercentage(document?.publicPoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' SORUMLULUK PUAN : ')} ${bold(document?.responsibilityPoints.toString())} (%${calculatePercentage(document?.responsibilityPoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' YETKILI ALMA    : ')} ${bold(document?.staffPoints.toString())} (%${calculatePercentage(document?.staffPoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' TAGLI ALMA      : ')} ${bold(document?.tagPoints.toString())} (%${calculatePercentage(document?.tagPoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' KAYIT PUAN      : ')} ${bold(document?.registerPoints.toString())} (%${calculatePercentage(document?.registerPoints, document?.totalPoints)})`,
        `${client.getEmoji('point')} ${inlineCode(' DIGER PUAN      : ')} ${bold(document?.otherPoints.toString())} (%${calculatePercentage(document?.otherPoints, document?.totalPoints)})\n`,
        `${client.getEmoji('exclamation')} ${bold('MIKTARLAR')}\n`,
        `${client.getEmoji('point')} ${inlineCode(' PUBLIC          : ')} ${bold('180')}`,
        `${client.getEmoji('point')} ${inlineCode(' SORUMLULUK      : ')} ${bold('50')}`,
        `${client.getEmoji('point')} ${inlineCode(' YETKILI ALMA    : ')} ${bold('20')}`,
        `${client.getEmoji('point')} ${inlineCode(' TAGLI ALMA      : ')} ${bold('20')}`,
        `${client.getEmoji('point')} ${inlineCode(' KAYIT           : ')} ${bold('50')}`,
        `${client.getEmoji('point')} ${inlineCode(' DIGER           : ')} ${bold('120')}`,
        `${client.getEmoji('point')} ${inlineCode(' DAVET           : ')} ${bold('50')}`,
        `${client.getEmoji('point')} ${inlineCode(' MESAJ           : ')} ${bold('1')}\n`,
        `${client.getEmoji('exclamation')} **Sesli kanalların süreleri __1 saat__ şeklinde onun haricindeki tüm görevler __1 adet__ şeklinde puanlandırılmıştır.**\n`,
        `${createBar(document?.totalPoints, role.POINT)} (\` ${document?.totalPoints >= role.POINT ? role.POINT : document?.totalPoints} / ${role.POINT} \`)`,
        `${newRole?.ROLE ? `<@&${newRole.ROLE}> rolüne ulaşmak için \` ${role.POINT - document?.totalPoints} \` puan daha kazanmalısınız.` : '**Son yetkide bulunuyorsunuz.**'}`
      ].join('\n'),
    })
  }
}

function createBar(current, required) {
  const percentage = Math.min((100 * current) / required, 100);
  const progress = Math.max(Math.round((percentage / 100) * 6), 0);
  let str = emoji(percentage > 0 ? 'Start' : 'EmptyStart');
  str += emoji('Mid').repeat(progress);
  str += emoji('EmptyMid').repeat(6 - progress);
  str += emoji(percentage === 100 ? 'End' : 'EmptyEnd');
  return str;
}

function emoji(name) {
  const findedEmoji = client.emojis.cache.find((e) => e.name === name);
  return findedEmoji ? findedEmoji.toString() : '';
}

function calculatePercentage(value, total) {
  return value ? Math.floor((100 * value) / total) : 0
}