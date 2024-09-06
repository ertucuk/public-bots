const { Events, ChannelType, Collection, EmbedBuilder, bold } = require("discord.js");
const { User, Servers, Punitive, ForceBan, Jail, Mute, VoiceMute } = require("../../../Global/Settings/Schemas");

module.exports = {
  Name: Events.GuildMemberAdd,
  System: true,

  execute: async (client, member) => {

    if (member.user.bot) return;
    const Users = await User.findOne({ userID: member.id });
    const Server = await Servers.findOne({ serverID: member.guild.id });
    const Forceban = await ForceBan.findOne({ ID: member.id });
    const quarantine = await Jail.findOne({ ID: member.id });
    const ads = await Punitive.findOne({ Member: member.id, Type: "Reklam", Active: true });
    const underworld = await Punitive.findOne({ Member: member.id, Type: "Underworld", Active: true });
    const fakeAccounts = member.guild.members.cache.filter((m) => (Date.now() - m.user.createdAt) / 1000 * 60 * 60 * 24 < 7 && Date.now() - m.joinedAt < 1 * 60 * 1000).size;
    const suspect = Date.now() - member.user.createdTimestamp <= 1000 * 60 * 60 * 24 * 7;

    if (fakeAccounts > 7) {
      await member.guild.set({ fastLogin: true });  
    } else if (member.guild.settings.fastLogin == false) {
      if (suspect) {
        await member.setRoles(Server.suspectedRole).catch();
        await member.guild.channels.cache.get(Server.registerChannel).send({ content: `${member} (${member.user.username} - ${member.id}) isimli üye sunucuya katıldı fakat hesabı <t:${Math.floor(member.user.createdTimestamp / 1000)}> (<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>) tarihinde oluşturulduğu için şüpheli olarak işaretlendi.` })
        const SuspectChannel = await client.getChannel("suspect-log", member)
        if (SuspectChannel) SuspectChannel.send({ embeds: [new global.VanteEmbed().setDescription(`${member} (${member.user.username} - ${member.id}) isimli üye sunucuya katıldı fakat hesabı <t:${Math.floor(member.user.createdTimestamp / 1000)}> açıldığı için şüpheli olarak işaretlendi.`)] })
        return;
      }

      if (quarantine) {
        await member.setRoles(Server.quarantineRole)
        return member.guild.channels.cache.get(Server.registerChannel).send({ content: `${member} (${member.user.username} - ${member.id}) isimli üye sunucumuza katıldı fakat aktif bir cezalandırılması bulunduğu için tekrardan cezalandırıldı.` });
      };

      if (ads) {
        await member.setRoles(Server.quarantineRole)
        return member.guild.channels.cache.get(Server.registerChannel).send({ content: `${member} (${member.user.username} - ${member.id}) isimli üye sunucumuza katıldı fakat aktif bir **REKLAM** cezası bulunduğu için tekrardan reklam cezası aldı.` });
      }

      if (underworld) {
        await member.setRoles(Server.underworldRole)
        return member.guild.channels.cache.get(Server.registerChannel).send({ content: `${member} (${member.user.username} - ${member.id}) isimli üye sunucumuza katıldı fakat aktif bir **UNDERWORLD** cezası bulunduğu için tekrardan Underworld'e gönderildi.` });
      };

      if (Forceban) {
        await member.ban({ reason: 'Forceban tarafından yasaklandı.' })
        return member.guild.channels.cache.get(Server.registerChannel).send({ content: `${member} (${member.user.username} - ${member.id}) isimli üye sunucumuza katıldı. fakat **FORCE-BAN** sistemi ile yasaklandığından dolayı sunucumuzda tekrar yasaklandı.` });
      };

      if (Server.bannedTags && Server.bannedTags.some(tag => member.user.displayName.includes(tag))) {
        await member.setRoles(Server.bannedTagRole).catch();
        member.send(`
        **Merhaba** ${member},
        
        Bu mesaj, sunucumuzdaki kurallarımıza uymadığı tespit edilen bir sembolün, sizin hesabınızda tespit edildiğini bildirmek amacıyla yazılmıştır. Üzerinizde bulunan (\`${Server.bannedTags.find(x => member.user.displayName.includes(x))}\`) sembolü sunucumuz kurallarına aykırı olduğu için hesabınız yasaklı kategorisine eklenmiştir.
           
        Bu durumun düzeltilmesi için, yasaklı sembolü kaldırmanız gerekmektedir. Söz konusu yasaklı sembol hesabınızdan çıkarıldığında, eğer daha önce kayıtlıysanız otomatik olarak kayıtlı duruma geçeceksiniz. Ancak, eğer kayıtlı değilseniz, tekrar kayıtsıza düşeceksiniz.
              
        Herhangi bir sorunuz veya açıklamanız için moderatör ekibimizle iletişime geçebilirsiniz.
              
        Saygılarımla,
        **${member.guild.name} Moderasyon Ekibi**
        `).catch(err => { });
        const bannedTagChannel = await client.getChannel("bannedtag-log", member)
        if (bannedTagChannel) bannedTagChannel.send({ embeds: [new global.VanteEmbed().setDescription(`${member} (${member.user.username} - ${member.id}) isimli üye sunucumuza katıldı fakat ismininde \` Yasaklı Tag \` bulundurduğu için cezalı olarak belirlendi.`)] })
        return member.guild.channels.cache.get(Server.registerChannel).send(`${member} (${member.user.username} - ${member.id}) isimli üye sunucumuza katıldı fakat ismininde \` Yasaklı Tag \` bulundurduğu için cezalı olarak belirlendi.`);
      };

      if (Server.autoRegister && Server.tagModedata === false) {
        const WelcomeChannel = member.guild.channels.cache.get(Server.registerChannel)
        const ChatChannel = member.guild.channels.cache.get(Server.chatChannel)
        const WelcomeLog = await client.getChannel("register-log", member)

        if (Users && Users.Gender == "Male") {
          if (WelcomeChannel) WelcomeChannel.send({ content: `${client.getEmoji("check")} ${member} adlı üye daha önce **Erkek** olarak kayıt olduğu için otomatik olarak kayıt edildi.` })
          if (ChatChannel) ChatChannel.send(`:tada: Merhaba ${member}! Tekrar aramıza hoş geldin!`).then(s => { setTimeout(() => { s.delete().catch(err => { }) }, 10000) })
          if (WelcomeLog) WelcomeLog.send({ embeds: [new EmbedBuilder().setDescription(`${member} isimli üyenin daha önceden verisi olduğu için otomatik olarak sistem tarafından <t:${Math.floor(Date.now() / 1000)}:R> **Erkek** olarak kayıt edildi.`)] })
          await User.updateOne({ userID: member.id }, { $push: { "Names": { Name: Users.userName, Reason: `Otomatik Kayıt`, Type: "AutoRegister", Role: Server.manRoles.map(x => member.guild.roles.cache.get(x)).join(","), Date: Date.now() } } }, { upsert: true })
          await member.setNickname(`${member.user.displayName.includes(Server.serverTag) ? `${Server.serverTag}` : `${Server.secondTag}`} ${Users.userName}`).catch(err => console.log(global.cevaplar.isimapi));
          await giveRole(member, Server.manRoles);
          return
        }

        if (Users && Users.Gender == "Girl") {
          if (WelcomeChannel) WelcomeChannel.send({ content: `${client.getEmoji("check")} ${member} adlı üye daha önce **Kız** olarak kayıt olduğu için otomatik olarak kayıt edildi.` })
          if (ChatChannel) ChatChannel.send(`:tada: Merhaba ${member}! Tekrar aramıza hoş geldin!`).then(s => { setTimeout(() => { s.delete().catch(err => { }) }, 10000) })
          if (WelcomeLog) WelcomeLog.send({ embeds: [new EmbedBuilder().setDescription(`${member} isimli üyenin daha önceden verisi olduğu için otomatik olarak sistem tarafından <t:${Math.floor(Date.now() / 1000)}:R> **Kadın** olarak kayıt edildi.`)] })
          await User.updateOne({ userID: member.id }, { $push: { "Names": { Name: Users.userName, Reason: `Otomatik Kayıt`, Type: "AutoRegister", Role: Server.womanRoles.map(x => member.guild.roles.cache.get(x)).join(","), Date: Date.now() } } }, { upsert: true })
          await member.setNickname(`${member.user.displayName.includes(Server.serverTag) ? `${Server.serverTag}` : `${Server.secondTag}`} ${Users.userName}`).catch(err => console.log(global.cevaplar.isimapi));
          await giveRole(member, Server.womanRoles);
          return
        }
      }

      if (Server.public && member.user.displayName.includes(Server.serverTag)) {
        await member.setNickname(`${Server.serverTag} İsim | Yaş`)
        await giveRole(member, Server.unregisterRoles);
        const tagLog = await client.getChannel("tag-log", member)
        if (tagLog) tagLog.send({ embeds: [new global.VanteEmbed().setTimestamp().setDescription(`${member} adlı kişi isminde \` ${member.guild.settings.serverTag} \` sembolü ile giriş yaptığından dolayı ailemize katıldı!\n\nSon kazanılan taglıdan sonra anlık taglı sayımız **${member.guild.members.cache.filter(x => x.user.displayName.includes(Server.serverTag)).size}** üye oldu.`)] })
      } else {
        await member.setNickname(`${Server.secondTag} İsim | Yaş`)
        await giveRole(member, Server.unregisterRoles);
      }

      const registerChannel = member.guild.channels.cache.get(Server.registerChannel)
      const rulesChannel = await client.getChannel(member.guild.rulesChannelId ? member.guild.rulesChannelId : "kurallar", member);
      const voiceChannel = member.guild.channels.cache
        .filter(x => x.parentId === Server.registerParent && x.type === ChannelType.GuildVoice)
        .reduce((prev, current) => (prev.members.size < current.members.size ? prev : current));

      if (registerChannel) registerChannel.wsend({
        content: [
          `### Merhabalar ${member}, ${member.guild.name} sunucumuza hoşgeldin.`,
          `Seninle beraber sunucumuz ${bold(member.guild.memberCount.toString())} üye sayısına ulaştı. 🎉`,
          `Hesabın ${client.timestamp(member.user.createdTimestamp, 'f')} tarihinde ${client.timestamp(member.user.createdTimestamp)} oluşturulmuş! <@&${Server.registerAuth.map(x => member.guild.roles.cache.get(x)).join(",")}> rolündeki yetkililer seninle ilgilenecektir.`,
          ' ',
          `Sunucuya erişebilmek için ${voiceChannel} odalarında kayıt olup ismini ve yaşını belirtmen gerekmektedir!`,
          `${rulesChannel} kanalından sunucu kurallarımızı okumayı ihmal etme!`
        ].join('\n'),
      });
    }
  }
};

async function giveRole(user, role) {
  let mutes = await Mute.findOne({ ID: user.id });
  let vmutes = await VoiceMute.findOne({ ID: user.id });
  let Roles = [...role]

  if (mutes && user.guild.settings.chatMuteRole) Roles.push(user.guild.settins.chatMuteRole)
  if (vmutes && user.guild.settings.voiceMuteRole) {
    Roles.push(user.guild.settings.voiceMuteRole);
    await user.voice.setMute(true).catch(err => { console.error(`[GuildMemberAdd] Sesli mute işlemi sırasında hata oluştu: ${err}`) });
  }
  if (user.guild.settings.public) {
    user.displayName.includes(user.guild.settings.serverTag) ? Roles.push(user.guild.settings.familyRole) : null;
  }
  await user.roles.set(Roles).catch(err => { });
}