const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionFlagsBits, BaseInteraction, inlineCode, codeBlock, bold } = require("discord.js");
const { Servers, Ticket, SecretRoom, Snipe, Tasks, Points } = require("../../../../../Global/Settings/Schemas");

module.exports.run = async (client, menu = BaseInteraction.prototype) => {
  const { customId: ID, guildId, channelId, message } = menu;

  const guild = client.guilds.cache.get(guildId);
  const channel = client.channels.cache.get(channelId);
  const server = await Servers.findOne({ serverID: global.system.serverID });
  const secretRoom = await SecretRoom.findOne({ ownerId: menu.user.id });

  if (ID == 'systems') {
    const selectMenu = menu.values[0];
    const memberID = message.content.match(/<@(\d+)>/);
    const member = guild.members.cache.get(memberID ? memberID[1] : null);
    const user = guild.members.cache.get(menu.user.id);

    if (member && member.user.id !== user.id) {
      return menu.reply({
        content: `${client.getEmoji("mark")} Bu menüyü kullanamazsın.`,
        ephemeral: true
      });
    }

    switch (selectMenu) {
      case 'system-settings':
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${guild.name} Sunucusunun Ayarları`, iconURL: guild.iconURL({ dynamic: true }) })
          .setFooter({ text: "Ayarları değiştirmek için yukardaki menüyü kullanabilirsiniz." })
          .setDescription(`
            **Sunucu Sistemleri**
            \` • \` Public Sistemi: ${server.public ? `\`🟢\` **Açık**` : `\`🔴\` **Kapalı**`}
            \` • \` İltifat Sistemi: ${server.compliment ? `\`🟢\` **Açık**` : `\`🔴\` **Kapalı**`}
            \` • \` Oto Kayıt Sistemi: ${server.autoRegister ? `\`🟢\` **Açık**` : `\`🔴\` **Kapalı**`}
            \` • \` Taglı Kayıt Sistemi: ${server.taggedMode ? `\`🟢\` **Açık**` : `\`🔴\` **Kapalı**`}
            \` • \` Kayıt Sistemi: ${server.registerSystem ? `\`🟢\` **Açık**` : `\`🔴\` **Kapalı**`}
            \` • \` Yaş Sistemi: ${server.minMinAge ? `\`🟢\` **Açık**` : `\`🔴\` **Kapalı**`}
            \` • \` Oto Yetki Sistemi: ${server.autoAuth ? `\`🟢\` **Açık**` : `\`🔴\` **Kapalı**`}

            **Sunucu Ayarları**
            \` • \` Sunucu Tagı: ${server.serverTag.trim() ? `\`${server.serverTag}\`` : "\`Ayarlanmamış!\`"}
            \` • \` Sunucu İkinci Tagı: ${server.secondTag.trim() ? `\`${server.secondTag}\`` : "\`Ayarlanmamış!\`"}
            \` • \` Sunucu Yasaklı Tag(ları): ${server.bannedTags && server.bannedTags.length === 1 ? `\`${server.bannedTags.map(x => x)}\`` : server.bannedTags.length === 2 ? `\`${server.bannedTags.join(' ve ')}\`` : server.bannedTags && server.bannedTags.length > 2 ? `\`${server.bannedTags.join(', ')}\`` : "\`Ayarlanmamış\`"}
            `)
        await menu.reply({ embeds: [embed], ephemeral: true })
        break;
      case 'public':
        if (server.public) {
          await guild.set({ public: false })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu public sistemi **kapatıldı.**`, ephemeral: true })
        } else if (!server.public) {
          await guild.set({ public: true })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu public sistemi **açıldı.**`, ephemeral: true })
        }

        const row31 = await generateRows(client, menu)
        const message31 = await menu.message.channel.messages.fetch(menu.message.id);
        message31.edit({ components: row31 })
        break;
      case 'compliment':
        if (server.compliment) {
          await guild.set({ compliment: false })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu iltifat sistemi **kapatıldı.**`, ephemeral: true })
        } else if (!server.compliment) {
          await guild.set({ compliment: true })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu iltifat sistemi **açıldı.**`, ephemeral: true })
        }

        const row = await generateRows(client, menu)
        const message = await menu.message.channel.messages.fetch(menu.message.id);
        message.edit({ components: row })
        break;
      case 'autoRegister':
        if (server.autoRegister) {
          await guild.set({ autoRegister: false })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Oto Kayıt sistemi **kapatıldı.**`, ephemeral: true })
        } else if (!server.autoRegister) {
          await guild.set({ autoRegister: true })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Oto Kayıt sistemi **açıldı.**`, ephemeral: true })
        }
        const row2 = await generateRows(client, menu)
        const message2 = await menu.message.channel.messages.fetch(menu.message.id);
        message2.edit({ components: row2 })
        break;
      case 'taggedMode':
        if (server.taggedMode) {
          await guild.set({ taggedMode: false })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Taglı Alım sistemi **kapatıldı.**`, ephemeral: true })
        } else if (!server.taggedMode) {
          await guild.set({ taggedMode: true })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Taglı Alım sistemi **açıldı.**`, ephemeral: true })
        }
        const row3 = await generateRows(client, menu)
        const message3 = await menu.message.channel.messages.fetch(menu.message.id);
        message3.edit({ components: row3 })
        break;
      case 'registerSystem':
        if (server.registerSystem) {
          await guild.set({ registerSystem: false })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Kayıt sistemi **kapatıldı.**`, ephemeral: true })
        } else if (!server.registerSystem) {
          await guild.set({ registerSystem: true })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Kayıt sistemi **açıldı.**`, ephemeral: true })
        }
        const row4 = await generateRows(client, menu)
        const message4 = await menu.message.channel.messages.fetch(menu.message.id);
        message4.edit({ components: row4 })
        break;
      case 'minMinAge':
        if (server.minMinAge) {
          await guild.set({ minMinAge: false })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Yaş sistemi **kapatıldı.**`, ephemeral: true })
        } else if (!server.minMinAge) {
          const modal31 = new ModalBuilder()
            .setCustomId('minminage')
            .setTitle('Sunucu Yaş Ayarla');
          const row = new ActionRowBuilder()
            .addComponents(
              new TextInputBuilder()
                .setCustomId('minminage2')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setLabel('Sunucu Min. Yaş Ayarla (1-99)')
                .setPlaceholder('Örn: 15')
                .setMinLength(1)
                .setMaxLength(3)
            )
          modal31.addComponents(row);
          await menu.showModal(modal31);
        }
        const row5 = await generateRows(client, menu)
        const message5 = await menu.message.channel.messages.fetch(menu.message.id);
        message5.edit({ components: row5 })
        break;
      case 'autoAuth':
        if (server.autoAuth) {
          await guild.set({ autoAuth: false })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Oto Yetki sistemi **kapatıldı.**`, ephemeral: true })
        } else if (!server.autoAuth) {
          await guild.set({ autoAuth: true })
          await menu.reply({ content: `${client.getEmoji("check")} Sunucu Oto Yetki sistemi **açıldı.**`, ephemeral: true })
        }
        const row6 = await generateRows(client, menu)
        const message6 = await menu.message.channel.messages.fetch(menu.message.id);
        message6.edit({ components: row6 })
        break;
      case 'serverTag':
        const modal2 = new ModalBuilder()
          .setCustomId('tagserver')
          .setTitle('Sunucu Tagını Ayarla');
        const servertag = new TextInputBuilder()
          .setCustomId('tagserver2')
          .setLabel("Sunucu Tagını Aşağı girin")
          .setStyle(TextInputStyle.Short);
        const firstActionRow2 = new ActionRowBuilder().addComponents(servertag);
        modal2.addComponents(firstActionRow2);
        await menu.showModal(modal2);
        break;
      case 'secondTag':
        const modal3 = new ModalBuilder()
          .setCustomId('tagsecond')
          .setTitle('Sunucu İkinci Tagını Ayarla');
        const secondtag = new TextInputBuilder()
          .setCustomId('tagsecond2')
          .setLabel("Sunucu İkinci Tagını Aşağı girin")
          .setStyle(TextInputStyle.Short);
        const firstActionRow3 = new ActionRowBuilder().addComponents(secondtag);
        modal3.addComponents(firstActionRow3);
        await menu.showModal(modal3);
        break;
      case 'bannedTags':
        const modal4 = new ModalBuilder()
          .setCustomId('bannedTags1')
          .setTitle('Sunucu Yasaklı Tag(lar)ını Ayarla');
        const bannedTag = new TextInputBuilder()
          .setCustomId('bannedTags2')
          .setLabel("Sunucu Yasaklı Tag(lar)ını Aşağı girin")
          .setStyle(TextInputStyle.Short);
        const firstActionRow4 = new ActionRowBuilder().addComponents(bannedTag);
        modal4.addComponents(firstActionRow4);
        await menu.showModal(modal4);
        break;
      default:
        break;
    }
  };

  if (ID == 'authorities-setup') {
    const selectMenu = menu.values[0];
    const memberID = message.content.match(/<@(\d+)>/);
    const member = guild.members.cache.get(memberID ? memberID[1] : null);
    const user = guild.members.cache.get(menu.user.id);

    if (member && member.user.id !== user.id) {
      return menu.reply({
        content: `${client.getEmoji("mark")} Bu menüyü kullanamazsın.`,
        ephemeral: true
      });
    }

    switch (selectMenu) {
      case 'authorities-settings':
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${guild.name} Sunucusunun Rolleri`, iconURL: guild.iconURL({ dynamic: true }) })
          .setFooter({ text: "Ayarları değiştirmek için yukardaki menüyü kullanabilirsiniz." })
          .setDescription(`
        **Tüm Yetkili Rolleri**
        ${server.staffs && server.staffs.length > 0 ? server.staffs.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Üst Yetkili Rolleri**
        ${server.maxStaffs && server.maxStaffs.length > 0 ? server.maxStaffs.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Orta Yetkili Rolleri**
        ${server.mediumStaffs && server.mediumStaffs.length > 0 ? server.mediumStaffs.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Alt Yetkili Rolleri**
        ${server.minStaffs && server.minStaffs.length > 0 ? server.minStaffs.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}
 
        **Admin Rolü**
        ${(server.minAdminRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **En Düşük Yetkili Rolü**
        ${(server.minStaffRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Kurucu Rolleri**
        ${server.ownerRoles && server.ownerRoles.length > 0 ? server.ownerRoles.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Taşıma Yetkilileri**
        ${server.transporterRoles && server.transporterRoles.length > 0 ? server.transporterRoles.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Çözüm Yetkilileri**
        ${server.solvingAuth && server.solvingAuth.length > 0 ? server.solvingAuth.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Kayıt Yetkilileri**
        ${server.registerAuth && server.registerAuth.length > 0 ? server.registerAuth.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}
 
        **Jail Yetkilileri**
        ${server.jailAuth && server.jailAuth.length > 0 ? server.jailAuth.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Ban Yetkilileri**
        ${server.banAuth && server.banAuth.length > 0 ? server.banAuth.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Ses Mute Yetkilileri**
        ${server.voiceMuteAuth && server.voiceMuteAuth.length > 0 ? server.voiceMuteAuth.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Chat Mute Yetkilileri**
        ${server.chatMuteAuth && server.chatMuteAuth.length > 0 ? server.chatMuteAuth.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}
        `)
        await menu.reply({ embeds: [embed], ephemeral: true })
        break;
      case 'staffs':
        const selectRoles = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu1")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles], ephemeral: true })
        break;
      case 'minAdminRole':
        const selectRoles2 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu2")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles2], ephemeral: true })
        break;
      case 'minStaffRole':
        const selectRoles3 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu3")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles3], ephemeral: true })
        break;
      case 'ownerRoles':
        const selectRoles4 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu4")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(10)
          ]);

        await menu.reply({ components: [selectRoles4], ephemeral: true })
        break;
      case 'transporterRoles':
        const selectRoles5 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu5")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles5], ephemeral: true })
        break;
      case 'solvingAuth':
        const selectRoles6 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu6")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles6], ephemeral: true })
        break;
      case 'registerAuth':
        const selectRoles7 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu7")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles7], ephemeral: true })
        break;
      case 'banAuth':
        const selectRoles8 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu8")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles8], ephemeral: true })
        break;
      case 'jailAuth':
        const selectRoles9 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu9")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles9], ephemeral: true })
        break;
      case 'voiceMuteAuth':
        const selectRoles10 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu10")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles10], ephemeral: true })
        break;
      case 'chatMuteAuth':
        const selectRoles11 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu11")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles11], ephemeral: true })
        break;
      case 'minStaffs':
        const selectRoles12 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu25")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles12], ephemeral: true })
        break;
      case 'mediumStaffs':
        const selectRoles13 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu26")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles13], ephemeral: true })
        break;
      case 'maxStaffs':
        const selectRoles14 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu27")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(20)
          ]);

        await menu.reply({ components: [selectRoles14], ephemeral: true })
        break;
      default:
        break;
    }
  };

  if (ID == 'roles-setup') {
    const selectMenu = menu.values[0];
    const memberID = message.content.match(/<@(\d+)>/);
    const member = guild.members.cache.get(memberID ? memberID[1] : null);
    const user = guild.members.cache.get(menu.user.id);

    if (member && member.user.id !== user.id) {
      return menu.reply({
        content: `${client.getEmoji("mark")} Bu menüyü kullanamazsın.`,
        ephemeral: true
      });
    }

    switch (selectMenu) {
      case 'role-settings':
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${guild.name} Sunucusunun Yetkili Rolleri`, iconURL: guild.iconURL({ dynamic: true }) })
          .setFooter({ text: "Ayarları değiştirmek için yukardaki menüyü kullanabilirsiniz." })
          .setDescription(`
        **Erkek Rolleri**
        ${server.manRoles && server.manRoles.length > 0 ? server.manRoles.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Kadın Rolleri**
        ${server.womanRoles && server.womanRoles.length > 0 ? server.womanRoles.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Kayıtsız Rolleri**
        ${server.unregisterRoles && server.unregisterRoles.length > 0 ? server.unregisterRoles.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Katıldı Rolü**
        ${(server.meetingRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Vip Rolü**
        ${(server.vipRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Aile Rolü**
        ${(server.familyRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Yasaklı Tag Rolü**
        ${(server.bannedTagRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Şüpheli Rolü**
        ${(server.suspectedRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Chat Mute Rolü**
        ${(server.chatMuteRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Karantina Rolü**
        ${(server.quarantineRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Reklam Rolü**
        ${(server.adsRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Underworld Rolü**
        ${(server.underworldRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Ses Mute Rolü**
        ${(server.voiceMuteRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Yayıncı Rolü**
        ${(server.streamerRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Streamer Cezalı Rolü**
        ${(server.stRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Etkinlik Cezalı Rolü**
        ${(server.etRole || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}
        `)
        await menu.reply({ embeds: [embed], ephemeral: true })
        break;
      case 'manRoles':
        const selectRoles = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu12")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(10)
          ]);

        await menu.reply({ components: [selectRoles], ephemeral: true })
        break;
      case 'womanRoles':
        const selectRoles2 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu13")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(10)
          ]);

        await menu.reply({ components: [selectRoles2], ephemeral: true })
        break;
      case 'unregisterRoles':
        const selectRoles3 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu14")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(10)
          ]);

        await menu.reply({ components: [selectRoles3], ephemeral: true })
        break;
      case 'vipRole':
        const selectRoles4 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu15")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles4], ephemeral: true })
        break;
      case 'familyRole':
        const selectRoles5 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu16")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles5], ephemeral: true })
        break;
      case 'bannedTagRole':
        const selectRoles6 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu17")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles6], ephemeral: true })
        break;
      case 'suspectedRole':
        const selectRoles7 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu18")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles7], ephemeral: true })
        break;
      case 'chatMuteRole':
        const selectRoles8 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu19")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles8], ephemeral: true })
        break;
      case 'quarantineRole':
        const selectRoles9 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu20")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles9], ephemeral: true })
        break;
      case 'adsRole':
        const selectRoles14 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu28")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles14], ephemeral: true })
        break;
      case 'underworldRole':
        const selectRoles10 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu21")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles10], ephemeral: true })
        break;
      case 'voiceMuteRole':
        const selectRoles11 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu22")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles11], ephemeral: true })
        break;
      case 'meetingRole':
        const selectRoles12 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu23")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles12], ephemeral: true })
        break;
      case 'streamerRole':
        const selectRoles13 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu24")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles13], ephemeral: true })
        break;
      case 'etRole':
        const selectRoles15 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu29")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles15], ephemeral: true })
        break;
      case 'stRole':
        const selectRoles16 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertu30")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRoles16], ephemeral: true })
        break;
      default:
        break;
    }
  }

  if (ID == 'channel-categories-setup') {
    const selectMenu = menu.values[0];
    const memberID = message.content.match(/<@(\d+)>/);
    const member = guild.members.cache.get(memberID ? memberID[1] : null);
    const user = guild.members.cache.get(menu.user.id);

    if (member && member.user.id !== user.id) {
      return menu.reply({
        content: `${client.getEmoji("mark")} Bu menüyü kullanamazsın.`,
        ephemeral: true
      });
    }

    switch (selectMenu) {
      case 'channel-settings':
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${guild.name} Sunucusunun Kanal ve Kategorileri`, iconURL: guild.iconURL({ dynamic: true }) })
          .setFooter({ text: "Ayarları değiştirmek için yukardaki menüyü kullanabilirsiniz." })
          .setDescription(`
        **Fotoğraf Kanalları**
        ${server.photoChannels && server.photoChannels.length > 0 ? server.photoChannels.filter(ertu => guild.channels.cache.has(ertu)).map(channel => `<#${channel}>`).listArray() : 'Ayarlı değil'}

        **Chat Kanalı**
        ${server.chatChannel ? (server.chatChannel || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        **Afk Kanalı**
        ${server.afkChannel ? (server.afkChannel || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        **Kayıt Kanalı**
        ${server.registerChannel ? (server.registerChannel || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}
        
        **Davetçi Kanalı**
        ${server.inviterChannel ? (server.inviterChannel || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        **Public Kategorisi**
        ${server.publicParent ? (server.publicParent || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        **Kayıt Kategorisi**
        ${server.registerParent ? (server.registerParent || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        **Secret Room Kategorisi**
        ${server.secretRoomParent ? (server.secretRoomParent || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        **Streamer Kategorisi**
        ${server.streamerParent ? (server.streamerParent || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}
  
        **Çözüm Kategorisi**
        ${server.solvingParent ? (server.solvingParent || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        **Aktivite Kategorisi**
        ${server.activityParent ? (server.activityParent || '').split(',').map(channel => `<#${channel.trim()}>`).join(', ') : 'Ayarlı değil'}

        `)
        await menu.reply({ embeds: [embed], ephemeral: true })
        break;
      case 'photoChannels':
        const selectChannels = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum1")
              .setPlaceholder('Bir kanal seçimi yapın!')
              .setChannelTypes(ChannelType.GuildText)
              .setMaxValues(10)
          ]);

        await menu.reply({ components: [selectChannels], ephemeral: true })
        break;
      case 'chatChannel':
        const selectChannels1 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum2")
              .setPlaceholder('Bir kanal seçimi yapın!')
              .setChannelTypes(ChannelType.GuildText)
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels1], ephemeral: true })
        break;
      case 'afkChannel':
        const selectChannels2 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum3")
              .setPlaceholder('Bir kanal seçimi yapın!')
              .setChannelTypes(ChannelType.GuildVoice)
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels2], ephemeral: true })
        break;
      case 'registerChannel':
        const selectChannels3 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum4")
              .setPlaceholder('Bir kanal seçimi yapın!')
              .setChannelTypes(ChannelType.GuildText)
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels3], ephemeral: true })
        break;
      case 'inviterChannel':
        const selectChannels4 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum5")
              .setPlaceholder('Bir kanal seçimi yapın!')
              .setChannelTypes(ChannelType.GuildText)
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels4], ephemeral: true })
        break;
      case 'publicParent':
        const selectChannels5 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum6")
              .addChannelTypes(ChannelType.GuildCategory)
              .setPlaceholder('Bir kategori seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels5], ephemeral: true })
        break;
      case 'registerParent':
        const selectChannels6 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum7")
              .addChannelTypes(ChannelType.GuildCategory)
              .setPlaceholder('Bir kategori seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels6], ephemeral: true })
        break;
      case 'streamerParent':
        const selectChannels7 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum8")
              .addChannelTypes(ChannelType.GuildCategory)
              .setPlaceholder('Bir kategori seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels7], ephemeral: true })
        break;
      case 'secretRoomParent':
        const selectChannels32 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum11")
              .addChannelTypes(ChannelType.GuildCategory)
              .setPlaceholder('Bir kategori seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels32], ephemeral: true })
        break;
      case 'solvingParent':
        const selectChannels8 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum9")
              .addChannelTypes(ChannelType.GuildCategory)
              .setPlaceholder('Bir kategori seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels8], ephemeral: true })
        break;
      case 'activityParent':
        const selectChannels9 = new ActionRowBuilder()
          .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("ertucum10")
              .addChannelTypes(ChannelType.GuildCategory)
              .setPlaceholder('Bir kategori seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectChannels9], ephemeral: true })
        break;
      default:
        break;
    }
  }

  if (ID == 'respons-setup') {

    const selectMenu = menu.values[0];
    const memberID = message.content.match(/<@(\d+)>/);
    const member = guild.members.cache.get(memberID ? memberID[1] : null);
    const user = guild.members.cache.get(menu.user.id);

    if (member && member.user.id !== user.id) {
      return menu.reply({
        content: `${client.getEmoji("mark")} Bu menüyü kullanamazsın.`,
        ephemeral: true
      });
    }

    switch (selectMenu) {
      case 'respons-settings':
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${guild.name} Sunucusunun Sorumluluk Rolleri`, iconURL: guild.iconURL({ dynamic: true }) })
          .setFooter({ text: "Ayarları değiştirmek için yukardaki menüyü kullanabilirsiniz." })
          .setDescription(`
        **Lider Rolleri**
        ${server.leaderRoles && server.leaderRoles.length > 0 ? server.leaderRoles.filter(ertu => guild.roles.cache.has(ertu)).map(role => `<@&${role}>`).listArray() : 'Ayarlı değil'}

        **Streamer Sorumlusu**
        ${(server.streamerResponsible || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Register Sorumlusu**
        ${(server.registerResponsible || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Yetkili Sorumlusu**
        ${(server.authResponsible || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Return Sorumlusu**
        ${(server.returnResponsible || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Streamer Denetleyicisi**
        ${(server.streamerController || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Register Denetleyicisi**
        ${(server.registerController || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Yetkili Denetleyicisi**
        ${(server.authController || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Return Denetleyicisi**
        ${(server.returnController || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        **Streamer Lideri**
        ${(server.streamerLeader || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}
        
        **Yetkili Lideri**
        ${(server.authLeader || '').split(',').map(roleId => roleId.trim()).filter(roleId => roleId !== '').map(roleId => `<@&${roleId}>`).join(', ') || 'Ayarlı değil'}

        `)
        await menu.reply({ embeds: [embed], ephemeral: true })
        break;
      case 'streamerResponsible':
        const selectRole = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum1")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole], ephemeral: true })
        break;
      case 'registerResponsible':
        const selectRole2 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum2")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole2], ephemeral: true })
        break;
      case 'publicResponsible':
        const selectRole3 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum3")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole3], ephemeral: true })
        break;
      case 'chatResponsible':
        const selectRole4 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum4")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole4], ephemeral: true })
        break;
      case 'authResponsible':
        const selectRole5 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum5")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole5], ephemeral: true })
        break;
      case 'streamerController':
        const selectRole6 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum6")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole6], ephemeral: true })
        break;
      case 'registerController':
        const selectRole7 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum7")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole7], ephemeral: true })
        break;
      case 'publicController':
        const selectRole8 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum8")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole8], ephemeral: true })
        break;
      case 'chatController':
        const selectRole9 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum9")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole9], ephemeral: true })
        break;
      case 'authController':
        const selectRole10 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum10")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole10], ephemeral: true })
        break;
      case 'streamerLeader':
        const selectRole11 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum11")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole11], ephemeral: true })
        break;
      case 'registerLeader':
        const selectRole12 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum12")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole12], ephemeral: true })
        break;
      case 'publicLeader':
        const selectRole13 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum13")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole13], ephemeral: true })
        break;
      case 'chatLeader':
        const selectRole14 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum14")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole14], ephemeral: true })
        break;
      case 'authLeader':
        const selectRole15 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum15")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole15], ephemeral: true })
        break;
      case 'leaderRoles':
        const selectRole16 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum16")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(15)
          ]);

        await menu.reply({ components: [selectRole16], ephemeral: true })
        break;
      case 'controllerRoles':
        const selectRole17 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum17")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(15)
          ]);

        await menu.reply({ components: [selectRole17], ephemeral: true })
        break;
      case 'returnResponsible':
        const selectRole18 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum18")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole18], ephemeral: true })
        break;
      case 'returnController':
        const selectRole19 = new ActionRowBuilder()
          .addComponents([
            new RoleSelectMenuBuilder()
              .setCustomId("ertum19")
              .setPlaceholder('Bir rol seçimi yapın!')
              .setMaxValues(1)
          ]);

        await menu.reply({ components: [selectRole19], ephemeral: true })
        break;
      default:
        break;
    }
  }

  const set = async (key, content) => {
    const value = menu.values;

    const currentSettingValue = guild.settings[key];

    if (Array.isArray(currentSettingValue)) {
      await guild.set({ [key]: value });
    } else {
      await guild.set({ [key]: value[0] });
    }

    await menu.reply({ content: `${client.getEmoji("check")} Sunucu ${content} güncellendi.`, ephemeral: true }).catch((ertu) => { });
    const row = await generateRows(client, message)
    const msg = await message.channel.messages.fetch(menu.message.reference.messageId).catch((ertu) => { });
    msg.edit({ components: row })
  };

  if (ID.startsWith('ertu')) {
    switch (ID) {
      case 'ertu1':
        await set('staffs', 'yetkili rolleri');
        break;
      case 'ertu2':
        await set('minAdminRole', 'Min Admin rolleri');
        break;
      case 'ertu3':
        await set('minStaffRole', 'Min Staff rolleri');
        break;
      case 'ertu4':
        await set('ownerRoles', 'Kurucu rolleri');
        break;
      case 'ertu5':
        await set('transporterRoles', 'Taşıyıcı rolleri');
        break;
      case 'ertu6':
        await set('solvingAuth', 'Sorun çözücü rolleri');
        break;
      case 'ertu7':
        await set('registerAuth', 'Kayıt yetkili rolleri');
        break;
      case 'ertu8':
        await set('banAuth', 'Ban yetkili rolleri');
        break;
      case 'ertu9':
        await set('jailAuth', 'Jail yetkili rolleri');
        break;
      case 'ertu10':
        await set('voiceMuteAuth', 'Ses Mute yetkili rolleri');
        break;
      case 'ertu11':
        await set('chatMuteAuth', 'Chat Mute yetkili rolleri');
        break;
      case 'ertu12':
        await set('manRoles', 'Erkek rolleri');
        break;
      case 'ertu13':
        await set('womanRoles', 'Kadın rolleri');
        break;
      case 'ertu14':
        await set('unregisterRoles', 'Kayıtsız rolleri');
        break;
      case 'ertu15':
        await set('vipRole', 'Vip rolleri');
        break;
      case 'ertu16':
        await set('familyRole', 'Ekip rolleri');
        break;
      case 'ertu17':
        await set('bannedTagRole', 'Yasaklı Tag rolleri');
        break;
      case 'ertu18':
        await set('suspectedRole', 'Şüpheli rolleri');
        break;
      case 'ertu19':
        await set('chatMuteRole', 'Chat Mute rolleri');
        break;
      case 'ertu20':
        await set('quarantineRole', 'Karantina rolleri');
        break;
      case 'ertu21':
        await set('underworldRole', 'Underworld rolleri');
        break;
      case 'ertu22':
        await set('voiceMuteRole', 'Ses Mute rolleri');
        break;
      case 'ertu23':
        await set('meetingRole', 'Katıldı Rolü');
        break;
      case 'ertu24':
        await set('streamerRole', 'Yayıncı Rolü');
        break;
      case 'ertu25':
        await set('minStaffs', 'Alt Yetkili Rolleri');
        break;
      case 'ertu26':
        await set('mediumStaffs', 'Orta Yetkili Rolleri');
        break;
      case 'ertu27':
        await set('maxStaffs', 'Üst Yetkili Rolleri');
        break;
      case 'ertu28':
        await set('adsRole', 'Reklam Rolü');
        break;
      case 'ertu29':
        await set('etRole', 'Etkinlik Cezalı Rolü');
        break;
      case 'ertu30':
        await set('stRole', 'Streamer Cezalı Rolü');
        break;
      default:
        break;
    }
  }

  if (ID.startsWith('ertucum')) {
    switch (ID) {
      case 'ertucum1':
        await set('photoChannels', 'Fotoğraf Kanalları');
        break;
      case 'ertucum2':
        await set('chatChannel', 'Chat kanalı');
        break;
      case 'ertucum3':
        await set('afkChannel', 'Afk kanalı');
        break;
      case 'ertucum4':
        await set('registerChannel', 'Kayıt kanalı');
        break;
      case 'ertucum5':
        await set('inviterChannel', 'Davet kanalı');
        break;
      case 'ertucum6':
        await set('publicParent', 'Public kategorisi');
        break;
      case 'ertucum7':
        await set('registerParent', 'Kayıt kategorisi');
        break;
      case 'ertucum11':
        await set('secretRoomParent', 'Özel Oda kategorisi');
        break;
      case 'ertucum8':
        await set('streamerParent', 'Yayıncı kategorisi');
        break;
      case 'ertucum9':
        await set('solvingParent', 'Sorun çözme kategorisi');
        break;
      case 'ertucum10':
        await set('activityParent', 'Aktivite kategorisi');
        break;
      default:
        break;
    }
  }

  if (ID.startsWith('ertum')) {
    switch (ID) {
      case 'ertum1':
        await set('streamerResponsible', 'Yayıncı Sorumlusu');
        break;
      case 'ertum2':
        await set('registerResponsible', 'Kayıt Sorumlusu');
        break;
      case 'ertum5':
        await set('authResponsible', 'Yetkili Sorumlusu');
        break;
      case 'ertum6':
        await set('streamerController', 'Yayıncı Denetleyicisi');
        break;
      case 'ertum7':
        await set('registerController', 'Kayıt Denetleyicisi');
        break;
      case 'ertum10':
        await set('authController', 'Yetkili Denetleyicisi');
        break;
      case 'ertum11':
        await set('streamerLeader', 'Yayıncı Lideri');
        break;
      case 'ertum15':
        await set('authLeader', 'Yetkili Lideri');
        break;
      case 'ertum16':
        await set('leaderRoles', 'Lider Rolleri');
        break;
      case 'ertum18':
        await set('returnResponsible', 'Return Sorumlusu');
        break;
      case 'ertum19':
        await set('returnController', 'Return Denetleyicisi');
        break;
      default:
        break;
    }
  }

  if (ID == 'AddUser') {

    if (!secretRoom) return await menu.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true })
    let channel = menu.guild.channels.cache.get(secretRoom.id)
    const selectedUsers = menu.values;
    if (menu.values.includes(menu.user.id)) return menu.reply({ content: 'Kendinizi ekleyemezsiniz.', ephemeral: true });

    const selectedUserNames = selectedUsers.map(userId => {
      const user = menu.guild.members.cache.get(userId)?.user;
      return user ? user.username : 'Bilinmeyen Kullanıcı';
    });

    selectedUsers.forEach(async x => {
      const user = menu.guild.members.cache.get(x)?.user;
      await channel.permissionOverwrites.create(user, { ViewChannel: true, Connect: true })
    });

    const replyMessage = `${inlineCode(selectedUserNames.join(','))} ${selectedUserNames.length > 1 ? 'kullanıcıları' : 'kullanıcısı'} başarıyla kanala eklendi!`;
    menu.reply({ content: replyMessage, components: [], ephemeral: true });
  }

  if (ID == 'RemoveUser') {

    if (!secretRoom) return await menu.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true })
    let channel = menu.guild.channels.cache.get(secretRoom.id)
    const selectedUsers = menu.values;

    const selectedUserNames = selectedUsers.map(userId => {
      const user = menu.guild.members.cache.get(userId)?.user;
      return user ? user.username : 'Bilinmeyen Kullanıcı';
    })

    selectedUsers.forEach(async userId => {
      const member = menu.guild.members.cache.get(userId);

      if (member?.voice.channel) {
        await member.voice.disconnect();
      }

      await channel.permissionOverwrites.delete(userId);
    });

    const replyMessage = `${selectedUserNames.join('\n')} kullanıcısı başarıyla kanaldan çıkarıldı!`;
    menu.reply({ content: replyMessage, components: [], ephemeral: true })
  }

  if (ID == 'GiveOwner') {

    if (!secretRoom) return await menu.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true })
    const selectedUser = menu.values;

    const selectedUserName = selectedUser.map(userId => {
      const user = menu.guild.members.cache.get(userId)?.user;
      return user ? user.id : 'Bilinmeyen Kullanıcı';
    })

    selectedUser.forEach(async x => {
      const user = menu.guild.members.cache.get(x)?.user;
      await SecretRoom.updateOne({ id: secretRoom.id }, { $set: { ownerId: user.id } })
    });

    menu.reply({ content: `<@${selectedUserName}> kullanıcısına oda sahipliği verildi.`, components: [], ephemeral: true })
  }

  if (ID == 'kisayollar') {

    let value = menu.values[0];

    function send(category) {
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({ name: menu.guild.name, iconURL: menu.guild.iconURL({ dynamic: true, size: 2048 }) })
        .setDescription(`${client.commands.filter(x => x.Category !== "-" && x.Category == category).map(x => `${client.getEmoji("point")} \` ${x.Usage} \``).join('\n')}`);

      menu.reply({ embeds: [embed], ephemeral: true });
    }

    switch (value) {
      case "Global":
        send("Global");
        break;
      case "Stat":
        send("Stat");
        break;
      case "Register":
        send("Register");
        break;
      case "Staff":
        send("Staff");
        break;
      case "Moderation":
        send("Moderation");
        break;
      case "Economy":
        send("Economy");
        break;
      case "Root":
        send("Root");
        break;
    }
  }

  if (ID == 'zodiac-roles') {

    const oyunlar = [
      "Koç",
      "Boğa",
      "Ikizler",
      "Yengeç",
      "Aslan",
      "Başak",
      "Terazi",
      "Akrep",
      "Yay",
      "Oğlak",
      "Kova",
      "Balık"
    ]

    const foundRoles = menu.guild.roles.cache.filter(role => oyunlar.includes(role.name));
    const removeRoles = menu.member.roles.cache.filter(x => oyunlar.includes(x.name));

    const values = menu.values;

    if (values[0].includes("rolistemiom")) {
      if (removeRoles.map(x => `${x.name}`).length == 0) return menu.reply({ content: `Üzerinde zaten rol bulunmuyor.`, ephemeral: true })
      removeRoles.forEach(x => {
        menu.member.roles.remove(x);
      });
      return menu.reply({ content: `${removeRoles.map(x => `${x}`)} rolü başarıyla silindi!`, ephemeral: true });
    }

    const addedRoles = [];
    for (i = 0; i < values.length; i++) {
      if (foundRoles.find(r => r.name.toLowerCase() === values[i])) {
        const gameRole = menu.guild.roles.cache.find(x => x.name.toLowerCase() === values[i]);
        if (removeRoles.length != 0) {
          removeRoles.forEach(x => {
            menu.member.roles.remove(x)
          });
        }
        menu.member.roles.add(gameRole.id);
        addedRoles.push(gameRole.id);
      }
    }

    menu.reply({ content: `${addedRoles.map(x => `<@&${x}>`).join(", ")} rolü başarıyla eklendi!`, ephemeral: true });
  }

  if (ID == "game-roles") {
    const oyunlar = [
      'Valorant',
      'LoL',
      'Minecraft',
      'CSGO',
      'GTA',
      'PUBG',
      'Fortnite',
      'ROBLOX',
    ];

    const foundRoles = menu.guild.roles.cache.filter(role => oyunlar.includes(role.name));

    const values = menu.values;
    if (values[0].includes("rolistemiom")) {
      const removeRoles = menu.member.roles.cache.filter(x => oyunlar.includes(x.name));
      if (removeRoles.map(x => `${x.name}`).length == 0) return menu.reply({ content: `Üzerinde zaten rol bulunmuyor.`, ephemeral: true })
      removeRoles.forEach(x => {
        menu.member.roles.remove(x);
      });
      return menu.reply({ content: `${removeRoles.map(x => `${x}`)} ${removeRoles.map(x => `${x.name}`).length > 1 ? 'rolleri' : 'rolü'} başarıyla silindi!`, ephemeral: true });
    }

    const addedRoles = [];
    for (i = 0; i < values.length; i++) {
      if (foundRoles.find(r => r.name.toLowerCase() === values[i])) {
        const gameRole = menu.guild.roles.cache.find(x => x.name.toLowerCase() === values[i])
        menu.member.roles.add(gameRole.id);
        addedRoles.push(gameRole.id);
      }
    }

    menu.reply({ content: `${addedRoles.map(x => `<@&${x}>`).join(", ")} rolü başarıyla eklendi!`, ephemeral: true });
  }

  if (ID == "color-roles") {

    if (menu.guild.settings.public && !menu.member.roles.cache.has(menu.guild.settings.familyRole) && !menu.member.roles.cache.has(menu.guild.settings.vipRole) && !menu.member.permissions.has(PermissionFlagsBits.Administrator) && !menu.member.roles.cache.has(menu.guild.roles.premiumSubscriberRole.id)) {
      return menu.reply({ content: `Bu menüyü kullanabilmek için Yönetici, <@&${menu.guild.settings.familyRole}> veya <@&${menu.guild.settings.vipRole}> rolüne sahip olmalısın.`, ephemeral: true });
    }


    if (!menu.guild.settings.public && !menu.member.roles.cache.has(menu.guild.settings.vipRole) && !menu.member.permissions.has(PermissionFlagsBits.Administrator) && !menu.member.roles.cache.has(menu.guild.roles.premiumSubscriberRole.id)) {
      return menu.reply({ content: `Bu menüyü kullanabilmek için Yönetici, <@&${menu.guild.roles.premiumSubscriberRole.id}> veya <@&${menu.guild.settings.vipRole}> rolüne sahip olmalısın.`, ephemeral: true });
    }

    const renkRoles = [
      'Gri',
      'Siyah',
      'Beyaz',
      'Kırmızı',
      'Mavi',
      'Sarı',
      'Yeşil',
      'Mor',
      'Turuncu',
      'Pembe',
      'Kahverengi'
    ];

    const foundRoles = menu.guild.roles.cache.filter(role => renkRoles.includes(role.name));
    const removeRoles = menu.member.roles.cache.filter(x => renkRoles.includes(x.name)) || [];

    const values = menu.values;

    if (values[0].includes("rolistemiom")) {
      if (removeRoles.map(x => `${x.name}`).length == 0) return menu.reply({ content: `Üzerinde zaten rol bulunmuyor.`, ephemeral: true })
      removeRoles.forEach(x => {
        menu.member.roles.remove(x);
      });
      return menu.reply({ content: `${removeRoles.map(x => `${x}`)} rolü başarıyla silindi!`, ephemeral: true });
    }

    const addedRoles = [];
    for (i = 0; i < values.length; i++) {
      if (foundRoles.find(r => r.name.toLowerCase() === values[i])) {
        const gameRole = menu.guild.roles.cache.find(x => x.name.toLowerCase() === values[i]);
        if (removeRoles.length != 0) {
          removeRoles.forEach(x => {
            menu.member.roles.remove(x)
          });
        }
        menu.member.roles.add(gameRole.id);
        addedRoles.push(gameRole.id);
      }
    }

    menu.reply({ content: `${addedRoles.map(x => `<@&${x}>`).join(", ")} rolü başarıyla eklendi!`, ephemeral: true });
  }

  if (ID == "relationship-roles") {
    const gameRoles = [
      "Couple",
      "Alone",
    ]

    const foundRoles = menu.guild.roles.cache.filter(role => gameRoles.includes(role.name));
    const removeRoles = menu.member.roles.cache.filter(x => gameRoles.includes(x.name));
    const values = menu.values;

    if (values[0].includes("rolistemiom")) {
      if (removeRoles.map(x => `${x.name}`).length == 0) return menu.reply({ content: `Üzerinde zaten rol bulunmuyor.`, ephemeral: true })
      removeRoles.forEach(x => {
        menu.member.roles.remove(x);
      });

      return menu.reply({ content: `${removeRoles.map(x => `${x}`)} rolü başarıyla silindi!`, ephemeral: true });
    }

    const addedRoles = [];
    for (i = 0; i < values.length; i++) {
      if (foundRoles.find(r => r.name.toLowerCase() === values[i])) {
        const gameRole = menu.guild.roles.cache.find(x => x.name.toLowerCase() === values[i]);
        if (removeRoles.length != 0) {
          removeRoles.forEach(x => {
            menu.member.roles.remove(x)
          });
        }
        menu.member.roles.add(gameRole.id);
        addedRoles.push(gameRole.id);
      }
    }

    menu.reply({ content: `${addedRoles.map(x => `<@&${x}>`).join(", ")} rolü başarıyla eklendi!`, ephemeral: true });
  }

  if (ID == 'snipe') {

    const data = await Snipe.findOne({ guildID: message.guild.id });
    const allSnipedMessages = data ? Object.values(data.deletedMessages) : [];
    const snipedMessages = allSnipedMessages.slice(-15).reverse();
    const selectedMessageIndex = parseInt(menu.values[0]);
    
    const selectedMessage = snipedMessages[selectedMessageIndex + 1];
    if (!selectedMessage) return;

    let replyContent = `Silinen Mesaj: **${selectedMessage.content}**\nMesaj Sahibi: <@${selectedMessage.author.id ? selectedMessage.author.id : 'Kullanıcı bulunamadı.'}>\nSilinme Tarihi: <t:${Math.floor(selectedMessage.timestamp / 1000)}:R>`;
    if (selectedMessage.attachments) {
      replyContent += selectedMessage.attachments ? `\n\nDosya: [Dosyaya tıkla!](${selectedMessage.attachments})` : '';
    }

    await menu.reply({ content: replyContent, ephemeral: true });
  }

  if (ID == 'selectBot') {
    const value = menu.values[0];
    if (!value) return menu.reply({ content: 'Bir bot seçimi yapmalısın.', ephemeral: true });

    const botClient = global.ertuBots.Main.find((c) => c.id === value) || global.ertuBots.Welcome.find((c) => c.id === value)
    const bot = message.guild.members.cache.get(value)
    if (!botClient) return menu.reply({ content: 'Belirtilen bot bulunamadı.', ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('selectAvatar')
        .setLabel("Avatar")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('selectName')
        .setLabel("İsmi")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('selectBio')
        .setLabel("Biyografi")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('selectBanner')
        .setLabel("Banner")
        .setStyle(ButtonStyle.Primary),
    )

    const banner = await bot.user.bannerURL({ dynamic: true });

    const embed = new EmbedBuilder({
      author: { name: menu.user.username, iconURL: menu.user.avatarURL() },
      color: client.random(),
      description: `${bot.user} adlı botun bilgileri aşağıda belirtilmiştir. Güncellemeler yapmak için aşağıdaki butonlardan birini seçebilirsin.`,
      fields: [
        { name: "İsmi", value: `${bot.user.username}`, inline: true },
        { name: "Avatar", value: `[Görüntüle](${bot.user.avatarURL({ dynamic: true })})`, inline: true },
        { name: "Banner", value: `[Görüntüle](${banner})`, inline: true },
        { name: "Biyografi", value: `${codeBlock('fix', `${botClient.description || 'Biyografi Bulunmuyor.'}`)}`, inline: false },
      ]
    })

    await menu.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  if (ID == 'staffList') {
    const value = menu.values[0];
    if (!value) return menu.reply({ content: 'Bir rol seçimi yapmalısın.', ephemeral: true });

    const role = message.guild.roles.cache.get(value);
    if (!role) return;

    const db = await Tasks.find({})
    const findedRole = db.filter(x => x.ROLE === role.id);

    const embed = new EmbedBuilder({
      color: client.random(),
      description: [
        `**${role.name}** rolünün görev bilgileri aşağıda verilmiştir.\n`,
        `${bold('Rol Sırası:')}`,
        `${findedRole[0].POSITION}. sırada\n`,
        `${bold('Rol:')}`,
        `${findedRole[0].ROLE ? `<@&${findedRole[0].ROLE}>` : 'Rol bulunmuyor.'}\n`,
        `${bold('Ekstra Rol:')}`,
        `${findedRole[0].EXTRA_ROLE ? `<@&${findedRole[0].EXTRA_ROLE}>` : 'Ekstra rol bulunmuyor.'}\n`,
        `${bold('Görevler:')}`,
        `${findedRole[0].REQUIRED_TASKS.map(task => `${task.NAME} - ${task.COUNT} ${task.COUNT_TYPE === 'CLASSIC' ? 'adet' : ''}`).join('\n')}`,
      ].join('\n')
    })

    menu.reply({ embeds: [embed], ephemeral: true });
  }

  if (ID == 'pointList') {
    const value = menu.values[0];
    if (!value) return menu.reply({ content: 'Bir rol seçimi yapmalısın.', ephemeral: true });

    const role = message.guild.roles.cache.get(value);
    if (!role) return;

    const db = await Points.find({})
    const findedRole = db.filter(x => x.ROLE === role.id);

    const embed = new EmbedBuilder({
      color: client.random(),
      description: [
        `**${role.name}** rolünün görev bilgileri aşağıda verilmiştir.\n`,
        `${bold('Rol Sırası:')}`,
        `${findedRole[0].POSITION}. sırada\n`,
        `${bold('Rol:')}`,
        `${findedRole[0].ROLE ? `<@&${findedRole[0].ROLE}>` : 'Rol bulunmuyor.'}\n`,
        `${bold('Ekstra Rol:')}`,
        `${findedRole[0].EXTRA_ROLE ? `<@&${findedRole[0].EXTRA_ROLE}>` : 'Ekstra rol bulunmuyor.'}\n`,
        `${bold('Puan:')}`,
        `${findedRole[0].POINT} puan`,
      ].join('\n')
    })

    menu.reply({ embeds: [embed], ephemeral: true });
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