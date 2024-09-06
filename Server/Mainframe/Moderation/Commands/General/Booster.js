const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');
const boosterCooldown = new Map();
const inviteRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/([a-zA-Z0-9\-]{2,32})\b/;
const adsRegex = /([^a-zA-ZIıİiÜüĞğŞşÖöÇç\s])+/gi;

module.exports = {
  Name: 'booster',
  Aliases: ['b', "boost", "zengin"],
  Description: 'Sunucuya takviye atan üyeler bu komut ile isim değişimi yapar.',
  Usage: 'booster <Isim>',
  Category: 'Global',
  Cooldown: 0,
  Command: { Prefix: true },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    if (!message.member.premiumSince && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu kullanabilmek için sunucuya takviye yapmanız gerekmektedir.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    } 

    const now = Date.now();
    const userCooldown = boosterCooldown.get(message.member.id);
    const expirationTime = userCooldown + 1000 * 60 * 15 * 1;
    const timeLeft = (expirationTime - now) / 1000;
    
    let name = args.join(' ');
    if (boosterCooldown.get(message.member.id) >= 1) {
      message.reply({ content: `${client.getEmoji("mark")} Booster özelliğini kullanabilmek için **${timeLeft.toFixed(1)}** (${client.timestamp(timeLeft)}) saniye beklemelisin.` });
      return;
    } 

    if (!name) {
      message.reply({ content: `${client.getEmoji("mark")} Lütfen bir isim belirtin.` });
      return;
    }

    if (name.length > 30) {
      message.reply({ content: `${client.getEmoji("mark")} İsminiz 30 karakterden fazla olamaz.` });
      return;
    }

    if (name.match(adsRegex)) {
      message.reply({ content: `${client.getEmoji("mark")} İsminiz özel harf içeremez.` });
      return;
    }

    if (name.match(inviteRegex)) {
      message.reply({ content: `${client.getEmoji("mark")} İsminiz davet içeremez.` });
      return;
    }
    
    let newName = name;
    if (message.guild.settings.public) {
      const age = message.member.displayName.split('|')[1];
      if (message.guild.settings.staffs.some(x => message.member.roles.cache.has(x))) newName = `${message.guild.settings.serverTag} ${age ? `${name} |${age}` : name}`
      else
      newName = `${message.member.user.displayName.includes(message.guild.settings.serverTag) ? message.guild.settings.serverTag : (message.guild.settings.secondTag ? message.guild.settings.secondTag : (message.guild.settings.secondTag || ""))} ${name}`
    } else {
      newName = `${message.guild.settings.secondTag} ${name}`
    }

    if (message.member.manageable) {
      message.member.setNickname(newName).then(s => {
        message.react(client.getEmoji("check"))
        message.reply({ content: `Başarıyla ismin \`${newName}\` olarak değiştirildi!` })
      })
    } else {
      message.react(client.getEmoji("mark"))
      message.reply({ content: `Değişiklik yaparken bir sorun meydana geldi.` })
    }

    boosterCooldown.set(message.member.id, now);
    setTimeout(() => {
      boosterCooldown.delete(message.member.id)
    }, 1000 * 60 * 15 * 1)
  },
};