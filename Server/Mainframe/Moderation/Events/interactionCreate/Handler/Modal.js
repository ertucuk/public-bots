const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField, EmbedBuilder, bold, inlineCode } = require("discord.js")
const { Servers, SecretRoom, User, Tasks } = require("../../../../../Global/Settings/Schemas");
const inviteRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/([a-zA-Z0-9\-]{2,32})\b/;
const adsRegex = /([^a-zA-ZIıİiÜüĞğŞşÖöÇç\s])+/gi;
const zaman = new Map();
const axios = require('axios');

module.exports.run = async (client, modal) => {
  const { customId: ID, guildId, channelId } = modal;

  const guild = client.guilds.cache.get(guildId);
  const channel = client.channels.cache.get(channelId);

  if (ID == 'tagserver') {
    const servertag = modal.fields.getTextInputValue('tagserver2');
    await guild.set({ serverTag: servertag })
    await modal.reply({ content: `${client.getEmoji("check")} Sunucu Tagı **${servertag}** olarak belirlendi.`, ephemeral: true })

    const row = await generateRows(client, modal)
    const message = await modal.message.channel.messages.fetch(modal.message.id);
    message.edit({ components: row })
  };

  if (ID == 'tagsecond') {
    const secondtag = modal.fields.getTextInputValue('tagsecond2');
    await guild.set({ secondTag: secondtag })
    await modal.reply({ content: `${client.getEmoji("check")} Sunucu İkinci Tagı **${secondtag}** olarak belirlendi.`, ephemeral: true })

    const row = await generateRows(client, modal)
    const message = await modal.message.channel.messages.fetch(modal.message.id);
    message.edit({ components: row })
  };

  if (ID == 'bannedTags1') {
    const bannedtag = modal.fields.getTextInputValue('bannedTags2');
    const bannedTagsArray = bannedtag.split(/\s+/);
    await guild.set({ bannedTags: bannedTagsArray });
    const formattedBannedTags = bannedTagsArray.join(', ');
    await modal.reply({ content: `${client.getEmoji("check")} Sunucu Yasaklı Tag(ları) **${formattedBannedTags}** olarak belirlendi.`, ephemeral: true })

    const row = await generateRows(client, modal)
    const message = await modal.message.channel.messages.fetch(modal.message.id);
    message.edit({ components: row })
  };

  if (ID == 'minminage') {
    const minage = modal.fields.getTextInputValue('minminage2');

    if (isNaN(minage)) return modal.reply({ content: `${client.getEmoji("mark")} Yaş sınırı sadece sayı olabilir.`, components: [], ephemeral: true });
    if (minage < 15 || minage > 99) return modal.reply({ content: `${client.getEmoji("mark")} Yaş sınırı 15 ile 99 arasında olabilir.`, components: [], ephemeral: true });

    await guild.set({ minMinAge: true })
    await guild.set({ minAge: minage });

    await modal.reply({ content: `${client.getEmoji("check")} Minumum Yaş **${minage}** olarak belirlendi ve Sunucu Yaş Sistemi **açıldı.**`, ephemeral: true })

    const row = await generateRows(client, modal)
    const message = await modal.message.channel.messages.fetch(modal.message.id);
    message.edit({ components: row })
  };

  if (ID == 'createRoomm') {
    const RoomName = modal.fields.getTextInputValue("channelName");
    const RoomLimit = modal.fields.getTextInputValue("channelLimit");
    if (inviteRegex.test(RoomName)) return modal.reply({ content: `${client.getEmoji("mark")} Kanal ismi davet içeremez.`, ephemeral: true });
    if (RoomName.length > 25) return modal.reply({ content: `${client.getEmoji("mark")} Kanal ismi 25 karakterden fazla olamaz.`, ephemeral: true });
    if (isNaN(RoomLimit)) return;

    modal.reply({ content: `${client.getEmoji("check")} Kanalınız başarıyla oluşturuldu`, ephemeral: true });

    await guild.channels.create({
      name: RoomName,
      type: ChannelType.GuildVoice,
      userLimit: RoomLimit > 99 ? 99 : RoomLimit,
      parent: guild.settings.secretRoomParent,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.Connect],
        },
        {
          id: modal.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect],
        },
      ],
    }).then(async (channel) => {
      new SecretRoom({
        id: channel.id,
        ownerId: modal.user.id,
      }).save();

      channel.send({
        content: `${modal.user}`,
        embeds: [
          new global.VanteEmbed()
            .setFooter({ text: `${modal.user.tag}`, iconURL: modal.user.displayAvatarURL({ dynamic: true }) })
            .setImage('https://i.hizliresim.com/c5lti6d.png')
        ],
        components: [
          new ActionRowBuilder()
            .setComponents(
              new ButtonBuilder().setCustomId("lock").setEmoji("1195645121107083326").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("unlock").setEmoji("1195645253311537184").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("invisible").setEmoji("1195645207283253248").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("visible").setEmoji("1195645212412870756").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("giveowner").setEmoji("1195645255157030924").setStyle(ButtonStyle.Secondary),
            ),
          new ActionRowBuilder()
            .setComponents(
              new ButtonBuilder().setCustomId("adduser").setEmoji("1195645261175865385").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("removeuser").setEmoji("1195645259745607720").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("edit").setEmoji("1195645257950437466").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("requestowner").setEmoji("1195645209149710469").setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId("deletechannel").setEmoji("1195645210609324073").setStyle(ButtonStyle.Secondary),
            ),
        ],
      })
    });
  }

  if (ID == 'editchannel') {
    const secretRoom = await SecretRoom.findOne({ ownerId: modal.user.id });
    const channel = await modal.guild.channels.cache.get(secretRoom.id);
    const channelName = modal.fields.getTextInputValue("ChannelName");
    const channelLimit = modal.fields.getTextInputValue("ChannelLimit");

    await channel.edit({
      name: channelName,
      userLimit: channelLimit > 99 ? 99 : channelLimit,
    });

    modal.reply({ content: `${client.getEmoji("check")} Kanalınız başarıyla güncellendi.`, ephemeral: true });
  }

  if (ID == 'changeNickname') {

    const nick = modal.fields.getTextInputValue("boost");

    if (zaman.get(modal.member.id) >= 1) return modal.reply({ content: `${client.getEmoji("mark")} Bu özelliği **15 Dakika** ara ile kullanabilirsin.`, ephemeral: true });
    if (!nick) return modal.reply({ content: `${client.getEmoji("mark")} Bir isim girmelisin.`, ephemeral: true });
    if (nick.length > 32) return modal.reply({ content: `${client.getEmoji("mark")} İsminiz 32 karakterden fazla olamaz.`, ephemeral: true });
    if (nick.match(adsRegex)) return modal.reply({ content: `${client.getEmoji("mark")} İsminiz özel harf içeremez.`, ephemeral: true });
    if (nick.match(inviteRegex)) return modal.reply({ content: `${client.getEmoji("mark")} İsminiz davet içeremez.`, ephemeral: true });

    let girilenisim;
    girilenisim = `${modal.member.user.username.includes(modal.guild.settings.serverTag) ? modal.guild.settings.serverTag : (modal.guild.settings.secondTag ? modal.guild.settings.secondTag : (modal.guild.settings.secondTag || ""))} ${nick}`;

    if (modal.member.manageable) {
      modal.member.setNickname(`${girilenisim}`).then(s => {
        modal.reply({ content: `Başarıyla ismin \`${girilenisim}\` olarak değiştirildi!`, ephemeral: true })
      })
    } else {
      modal.reply({ content: `Bu isimde değişiklik yapamıyorum.`, ephemeral: true })
    }

    zaman.set(modal.member.id, (zaman.get(modal.member.id) || 1));
    setTimeout(() => {
      zaman.delete(modal.member.id)
    }, 1000 * 60 * 15 * 1)
  }

  if (ID === 'streamer-appeal') {
    const resultURL = modal.fields.getTextInputValue('speedTest');
    if (!resultURL.includes('https://www.speedtest.net/result/')) return modal.reply({ content: `${client.getEmoji('mark')} Lütfen geçerli bir SpeedTest sonucu linki giriniz.`, ephemeral: true });

    const result = await scrappeOoklaData(resultURL);

    const data = await User.findOne({ userID: modal.user.id });
    const voiceDays = data.Voices || {};
    const totalVoice = Object.keys(voiceDays).reduce((totalCount, currentDay) => totalCount + voiceDays[currentDay].total, 0);

    if (result.upload < 4) return modal.reply({ content: `${client.getEmoji('mark')} Streamer rolü almak için en az 4 Mbps yükleme hızına sahip olmalısınız.`, ephemeral: true });
    if (totalVoice < 3600000) return modal.reply({ content: `${client.getEmoji('mark')} Streamer rolü almak için en az 1 saat ses kanallarında vakit geçirmelisiniz.`, ephemeral: true });

    modal.reply({ content: `${client.getEmoji('check')} Streamer başvurunuz sistemimiz tarafından kabul edildi ve streamer rolü üzerinize verildi.`, ephemeral: true });
    modal.member.roles.add(modal.guild.settings.streamerRole);

    const channel = await client.getChannel('streamer-log', modal);
    if (!channel) return;

    const embed = new EmbedBuilder({
      color: client.random(),
      image: { url: `${resultURL}.png` },
      footer: { text: `${modal.guild.name} | Created By Ertu` },
      description: `${modal.user} streamer başvurusu yaptı otomatik olarak kabul edildi!`,
    })

    channel.send({ content: `${modal.member} <@&${modal.guild.settings.streamerResponsible}> <@&${modal.guild.settings.streamerController}>`, embeds: [embed] });
  }

  if (ID == 'addTask') {

    const roleValues = await modal.fields.getTextInputValue("roleId").split(",").map(value => value.trim());
    const message = await modal.fields.getTextInputValue("messageTask")
    const afk = await modal.fields.getTextInputValue("afkTask")
    const streamer = await modal.fields.getTextInputValue("streamerTask")
    const public = await modal.fields.getTextInputValue("publicTask")

    const role = roleValues[0];
    const extraRole = roleValues[1].trim();
    const day = roleValues[2].trim();

    const data = await Tasks.find({});

    const requiredTasks = [];

    if (message) {
      requiredTasks.push({
        TYPE: "MESSAGE",
        NAME: `Mesaj Kanallarında`,
        COUNT: parseInt(message),
        COUNT_TYPE: "CLASSIC"
      });
    }

    if (afk) {
      requiredTasks.push({
        TYPE: "AFK",
        NAME: `Afk Odasında`,
        COUNT: `${afk}h`,
        COUNT_TYPE: "TIME"
      });
    }

    if (streamer) {
      requiredTasks.push({
        TYPE: "STREAMER",
        NAME: `Streamer Odalarda`,
        COUNT: `${streamer}h`,
        COUNT_TYPE: "TIME"
      });
    }

    if (public) {
      requiredTasks.push({
        TYPE: "PUBLIC",
        NAME: `Public Odalarda`,
        COUNT: `${public}h`,
        COUNT_TYPE: "TIME"
      });
    }

    new Tasks({
      POSITION: data?.length + 1,
      ROLE: role,
      EXTRA_ROLE: extraRole,
      DAY: parseInt(day),
      REQUIRED_TASKS: requiredTasks
    }).save();

    await modal.reply({ content: `${client.getEmoji("check")} Görev başarıyla eklendi.`, ephemeral: true });
  }

  if (ID == 'auth-support-appeal') {

    const time = await modal.fields.getTextInputValue("how-time");
    const history = await modal.fields.getTextInputValue("history-auth");
    const communacationAuth = await modal.fields.getTextInputValue("communacation");
    const why = await modal.fields.getTextInputValue("why-auth");

    const logChannel = await client.getChannel('auth-appeal-log', modal)

    modal.reply({ content: `${client.getEmoji("check")} Yetkili başvurunuz başarıyla alındı!`, ephemeral: true });

    const msg = await logChannel.send({
      content: `${modal.member}`,
      embeds: [
        new EmbedBuilder({
          color: client.random(),
          footer: { text: `${modal.guild.name} | Created By Ertu` },
          url: 'https://discord.gg/ertu',
          title: 'Bir yetkili başvurusu yapıldı.',
          thumbnail: { url: modal.member.user.displayAvatarURL({ dynamic: true }) },
          description: `${modal.member} adlı kullanıcı yetkili başvurusu yaptı.\n`,
          timestamp: new Date(),
          fields: [
            { name: 'Günlük Kaç Saat Aktif Olabilirsin?', value: `\`\`\`${time}\`\`\``, inline: false },
            { name: 'Daha Önce Hangi Sunucularda Yetkili Oldun?', value: `\`\`\`${history}\`\`\``, inline: false },
            { name: 'İletişim Yeteneğin Nasıl?', value: `\`\`\`${communacationAuth}\`\`\``, inline: false },
            { name: 'Neden Yetkili Olmak İstiyorsun?', value: `\`\`\`${why}\`\`\``, inline: false },
          ],
        })
      ],
      components: [
        new ActionRowBuilder()
          .setComponents(
            new ButtonBuilder().setCustomId("accept").setLabel("Onayla").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("cancel").setLabel("Reddet").setStyle(ButtonStyle.Danger)
          )
      ]
    });

    const collector = msg.createMessageComponentCollector();
    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'accept') {
        await interaction.deferUpdate();
        await modal.user.send({ content: `Yetkili başvurunuz kabul edildi!` });
        await msg.edit({ components: [] });
      } else if (interaction.customId === 'cancel') {
        await interaction.deferUpdate();
        await modal.user.send({ content: `Yetkili başvurunuz reddedildi! Üzgünüz.` });
        await msg.edit({ components: [] });
      }
    });
  }
}

async function generateRows(client, message) {
  const data = await Servers.findOne({ serverID: message.guild.id });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('channel-setup').setLabel('Log Kurulumu').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('role-setup').setLabel('Rol Kurulumu').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('emoji-setup').setLabel('Emoji Kurulumu').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('respons-setup').setLabel('Sorumluluk Kurulumu').setStyle(ButtonStyle.Secondary)
  );

  const row1 = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setPlaceholder("Sistemleri & Ayarları Güncellemek İçin Tıkla!")
      .setCustomId("systems")
      .addOptions([
        { label: "Ayarları Görüntüle", value: "system-settings", description: "Sunucudaki ayarları görüntüleyebilirsiniz.", emoji: "1265261055748079696" },
        { label: "Public Sistemi", value: "public", description: "Sunucudaki public sistemini ayarlayabilirsiniz.", emoji: data.public ? "✅" : "❌" },
        { label: "İltifat Sistemi", value: "compliment", description: "Sunucudaki İltifat sistemini ayarlayabilirsiniz.", emoji: data.compliment ? "✅" : "❌" },
        { label: "Oto Kayıt Sistemi", value: "autoRegister", description: "Sunucudaki Oto Kayıt sistemini ayarlayabilirsiniz.", emoji: data.autoRegister ? "✅" : "❌" },
        { label: "Taglı Alım Sistemi", value: "taggedMode", description: "Sunucudaki Taglı Alım sistemini ayarlayabilirsiniz.", emoji: data.taggedMode ? "✅" : "❌" },
        { label: "Kayıt Sistemi", value: "registerSystem", description: "Sunucudaki Kayıt sistemini ayarlayabilirsiniz.", emoji: data.registerSystem ? "✅" : "❌" },
        { label: "Yaş Sistemi", value: "minMinAge", description: "Sunucudaki Yaş sistemini ayarlayabilirsiniz.", emoji: data.minMinAge ? "✅" : "❌" },
        { label: "Oto Yetki Sistemi", value: "autoAuth", description: "Sunucudaki Oto Yetki sistemini ayarlayabilirsiniz.", emoji: data.autoAuth ? "✅" : "❌" },
        { label: "Sunucu Tagı", value: "serverTag", description: "Sunucudaki Tagı ayarlayabilirsiniz.", emoji: data.serverTag.trim() !== "" ? "✅" : "❌" },
        { label: "Sunucu İkinci Tagı", value: "secondTag", description: "Sunucudaki 2.Tagı ayarlayabilirsiniz.", emoji: data.secondTag.trim() !== "" ? "✅" : "❌" },
        { label: "Sunucunun Yasaklı Tagları", value: "bannedTags", description: "Sunucudaki Yasaklı Tagları ayarlayabilirsiniz.", emoji: data.bannedTags && data.bannedTags.length > 0 ? "✅" : "❌" },
      ]));

  const row2 = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setPlaceholder("Yetkili Rolleri Güncellemek İçin Tıkla!")
      .setCustomId("authorities-setup")
      .addOptions([
        { label: "Ayarları Görüntüle", value: "authorities-settings", description: "Sunucudaki yetkili rol ayarlarını görüntüleyebilirsiniz.", emoji: { id: "1265261055748079696" } },
        { label: "Yetkili Rolleri", value: "staffs", description: "Sunucudaki Yetkili rollerini ayarlayabilirsiniz.", emoji: data.staffs && data.staffs.length > 0 ? "✅" : "❌" },
        { label: "Üst Yetkili Rolleri", value: "maxStaffs", description: "Sunucudaki Üst Yetkili rollerini ayarlayabilirsiniz.", emoji: data.maxStaffs && data.maxStaffs.length > 0 ? "✅" : "❌" },
        { label: "Orta Yetkili Rolleri", value: "mediumStaffs", description: "Sunucudaki Yetkili rollerini ayarlayabilirsiniz.", emoji: data.mediumStaffs && data.mediumStaffs.length > 0 ? "✅" : "❌" },
        { label: "Alt Yetkili Rolleri", value: "minStaffs", description: "Sunucudaki Alt Yetkili rollerini ayarlayabilirsiniz.", emoji: data.minStaffs && data.minStaffs.length > 0 ? "✅" : "❌" },
        { label: "Admin Rolü", value: "minAdminRole", description: "Sunucudaki Minimum admin rolünü ayarlayabilirsiniz.", emoji: data.minAdminRole.trim() !== "" ? "✅" : "❌" },
        { label: "Yetkili Rolü", value: "minStaffRole", description: "Sunucudaki Minimum yetkili rolünü ayarlayabilirsiniz.", emoji: data.minStaffRole.trim() !== "" ? "✅" : "❌" },
        { label: "Kurucu Rolleri", value: "ownerRoles", description: "Sunucudaki Kurucu Rollerini ayarlayabilirsiniz.", emoji: data.ownerRoles && data.ownerRoles.length > 0 ? "✅" : "❌" },
        { label: "Taşıma Yetkilileri", value: "transporterRoles", description: "Sunucudaki Taşıma yetkililerini ayarlayabilirsiniz.", emoji: data.transporterRoles && data.transporterRoles.length > 0 ? "✅" : "❌" },
        { label: "Sorun Çözme Yetkilileri", value: "solvingAuth", description: "Sunucudaki Çözüm Yetkililerini ayarlayabilirsiniz.", emoji: data.solvingAuth && data.solvingAuth.length > 0 ? "✅" : "❌" },
        { label: "Kayıt Yetkilileri", value: "registerAuth", description: "Sunucudaki Kayıt yetkililerini ayarlayabilirsiniz.", emoji: data.registerAuth && data.registerAuth.length > 0 ? "✅" : "❌" },
        { label: "Ban Yetkilileri", value: "banAuth", description: "Sunucudaki Ban yetkililerini ayarlayabilirsiniz.", emoji: data.banAuth && data.banAuth.length > 0 ? "✅" : "❌" },
        { label: "Jail Yetkilileri", value: "jailAuth", description: "Sunucudaki Jail yetkilileriniayarlayabilirsiniz.", emoji: data.jailAuth && data.jailAuth.length > 0 ? "✅" : "❌" },
        { label: "Ses Mute Yetkilileri", value: "voiceMuteAuth", description: "Sunucudaki Ses Mute yetkililerini ayarlayabilirsiniz.", emoji: data.voiceMuteAuth && data.voiceMuteAuth.length > 0 ? "✅" : "❌" },
        { label: "Chat Mute Yetkilileri", value: "chatMuteAuth", description: "Sunucudaki Chat Mute yetkililerini ayarlayabilirsiniz.", emoji: data.chatMuteAuth && data.chatMuteAuth.length > 0 ? "✅" : "❌" },
      ]));

  const row3 = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setPlaceholder("Rolleri Güncellemek İçin Tıkla!")
      .setCustomId("roles-setup")
      .addOptions([
        { label: "Ayarları Görüntüle", value: "role-settings", description: "Sunucudaki rol ayarlarını görüntüleyebilirsiniz.", emoji: { id: "1265261055748079696" } },
        { label: "Erkek Rolleri", value: "manRoles", description: "Sunucudaki Erkek Rollerini ayarlayabilirsiniz.", emoji: data.manRoles && data.manRoles.length > 0 ? "✅" : "❌" },
        { label: "Kadın Rolleri", value: "womanRoles", description: "Sunucudaki Kadın Rollerini ayarlayabilirsiniz.", emoji: data.womanRoles && data.womanRoles.length > 0 ? "✅" : "❌" },
        { label: "Kayıtsız Rolleri", value: "unregisterRoles", description: "Sunucudaki Kayıtsız Rollerini ayarlayabilirsiniz.", emoji: data.unregisterRoles && data.unregisterRoles.length > 0 ? "✅" : "❌" },
        { label: "Vip Rolü", value: "vipRole", description: "Sunucudaki Vip Rolünü ayarlayabilirsiniz.", emoji: data.vipRole.trim() !== "" ? "✅" : "❌" },
        { label: "Streamer Rolü", value: "streamerRole", description: "Sunucudaki Yayıncı Rolünü ayarlayabilirsiniz.", emoji: data.streamerRole.trim() !== "" ? "✅" : "❌" },
        { label: "Katıldı Rolü", value: "meetingRole", description: "Sunucudaki Katıldı Rolünü ayarlayabilirsiniz.", emoji: data.meetingRole.trim() !== "" ? "✅" : "❌" },
        { label: "Aile Rolü", value: "familyRole", description: "Sunucudaki Aile Rolünü ayarlayabilirsiniz.", emoji: data.familyRole.trim() !== "" ? "✅" : "❌" },
        { label: "Yasaklı Tag Rolü", value: "bannedTagRole", description: "Sunucudaki Yasaklı Tag Rolünü ayarlayabilirsiniz.", emoji: data.bannedTagRole.trim() !== "" ? "✅" : "❌" },
        { label: "Şüpheli Rolü", value: "suspectedRole", description: "Sunucudaki Şüpheli Rolünü ayarlayabilirsiniz.", emoji: data.suspectedRole.trim() !== "" ? "✅" : "❌" },
        { label: "Chat Mute Rolü", value: "chatMuteRole", description: "Sunucudaki Chat Mute Rolünü ayarlayabilirsiniz.", emoji: data.chatMuteRole.trim() !== "" ? "✅" : "❌" },
        { label: "Karantina Rolü", value: "quarantineRole", description: "Sunucudaki Karantina Rolünü ayarlayabilirsiniz.", emoji: data.quarantineRole.trim() !== "" ? "✅" : "❌" },
        { label: "Reklam Rolü", value: "adsRole", description: "Sunucudaki Reklam Rolünü ayarlayabilirsiniz.", emoji: data.adsRole.trim() !== "" ? "✅" : "❌" },
        { label: "Underworld Rolü", value: "underworldRole", description: "Sunucudaki Underworld Rolünü ayarlayabilirsiniz.", emoji: data.underworldRole.trim() !== "" ? "✅" : "❌" },
        { label: "Ses Mute Rolü", value: "voiceMuteRole", description: "Sunucudaki Ses Mute Rolünü ayarlayabilirsiniz.", emoji: data.voiceMuteRole.trim() !== "" ? "✅" : "❌" },
        { label: "Etkinlik Ceza Rolü", value: "etRole", description: "Sunucudaki Etkinlik Ceza Rolünü ayarlayabilirsiniz.", emoji: data.etRole.trim() !== "" ? "✅" : "❌" },
        { label: "Streamer Ceza Rolü", value: "stRole", description: "Sunucudaki Streamer Ceza Rolünü ayarlayabilirsiniz.", emoji: data.stRole.trim() !== "" ? "✅" : "❌" },
      ]));

  const row4 = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setPlaceholder("Kanalları ve Kategorileri Güncellemek İçin Tıkla!")
      .setCustomId("channel-categories-setup")
      .addOptions([
        { label: "Ayarları Görüntüle", value: "channel-settings", description: "Sunucudaki kanal ayarlarını görüntüleyebilirsiniz.", emoji: { id: "1265261055748079696" } },
        { label: "Fotoğraf Kanalı", value: "photoChannels", description: "Sunucudaki Fotoğraf kanalını ayarlayabilirsiniz.", emoji: data.photoChannels && data.photoChannels.length > 0 ? "✅" : "❌" },
        { label: "Chat Kanalı", value: "chatChannel", description: "Sunucudaki Chat kanalını ayarlayabilirsiniz.", emoji: data.chatChannel.trim() !== "" ? "✅" : "❌" },
        { label: "Afk Kanalı", value: "afkChannel", description: "Sunucudaki Afk kanalını ayarlayabilirsiniz.", emoji: data.afkChannel.trim() !== "" ? "✅" : "❌" },
        { label: "Kayıt Kanalı", value: "registerChannel", description: "Sunucudaki Kayıt kanalını ayarlayabilirsiniz.", emoji: data.registerChannel.trim() !== "" ? "✅" : "❌" },
        { label: "Davetçi Kanalı", value: "inviterChannel", description: "Sunucudaki Davetçi kanalını ayarlayabilirsiniz.", emoji: data.inviterChannel.trim() !== "" ? "✅" : "❌" },
        { label: "Public Kategorisi", value: "publicParent", description: "Sunucudaki Public kategorisini ayarlayabilirsiniz.", emoji: data.publicParent.trim() !== "" ? "✅" : "❌" },
        { label: "Kayıt Kategorisi", value: "registerParent", description: "Sunucudaki Kayıt kategorisini ayarlayabilirsiniz.", emoji: data.registerParent.trim() !== "" ? "✅" : "❌" },
        { label: "Secret Room Kategorisi", value: "secretRoomParent", description: "Sunucudaki Secret kategorisini ayarlayabilirsiniz.", emoji: data.secretRoomParent.trim() !== "" ? "✅" : "❌" },
        { label: "Streamer Kategorisi", value: "streamerParent", description: "Sunucudaki Streamer kategorisini ayarlayabilirsiniz.", emoji: data.streamerParent.trim() !== "" ? "✅" : "❌" },
        { label: "Çözüm Kategorisi", value: "solvingParent", description: "Sunucudaki Çözüm kategorisini ayarlayabilirsiniz.", emoji: data.solvingParent.trim() !== "" ? "✅" : "❌" },
        { label: "Aktivite Kategorisi", value: "activityParent", description: "Sunucudaki Aktivite kategorisini ayarlayabilirsiniz.", emoji: data.activityParent.trim() !== "" ? "✅" : "❌" },
      ]));

  return [row, row1, row2, row3, row4];
}

async function scrappeOoklaData(url) {
  return axios.get(url).then(async (response) => {
    const match = response.data.match(/window\.OOKLA\.INIT_DATA\s*=\s*(\{.*?\});/);
    if (!match) return null;
    const result = JSON.parse(match[1]).result;

    return {
      download: result.download ? String(result.download).slice(0, -3) : null,
      upload: result.upload ? String(result.upload).slice(0, -3) : null
    }

  }).catch((error) => {
    console.error(error);
    return null;
  });
}