const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { Servers } = require('../../../../../Global/Settings/Schemas')

module.exports = {
    Name: 'setup',
    Aliases: ['kur', "kurulum", "panel"],
    Description: 'Kurulum paneli',
    Usage: 'setup',
    Category: 'Root',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

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
                    { label: "Public Sistemi", value: "public", description: "Sunucudaki public sistemini ayarlayabilirsiniz.", emoji: message.guild.settings.public ? "✅" : "❌" },
                    { label: "İltifat Sistemi", value: "compliment", description: "Sunucudaki İltifat sistemini ayarlayabilirsiniz.", emoji: message.guild.settings.compliment ? "✅" : "❌" },
                    { label: "Oto Kayıt Sistemi", value: "autoRegister", description: "Sunucudaki Oto Kayıt sistemini ayarlayabilirsiniz.", emoji: message.guild.settings.autoRegister ? "✅" : "❌" },
                    { label: "Taglı Alım Sistemi", value: "taggedMode", description: "Sunucudaki Taglı Alım sistemini ayarlayabilirsiniz.", emoji: message.guild.settings.taggedMode ? "✅" : "❌" },
                    { label: "Kayıt Sistemi", value: "registerSystem", description: "Sunucudaki Kayıt sistemini ayarlayabilirsiniz.", emoji: message.guild.settings.registerSystem ? "✅" : "❌" },
                    { label: "Yaş Sistemi", value: "minMinAge", description: "Sunucudaki Yaş sistemini ayarlayabilirsiniz.", emoji: message.guild.settings.minMinAge ? "✅" : "❌" },
                    { label: "Oto Yetki Sistemi", value: "autoAuth", description: "Sunucudaki Oto Yetki sistemini ayarlayabilirsiniz.", emoji: message.guild.settings.autoAuth ? "✅" : "❌" },
                    { label: "Sunucu Tagı", value: "serverTag", description: "Sunucudaki Tagı ayarlayabilirsiniz.", emoji: message.guild.settings.serverTag.trim() !== "" ? "✅" : "❌" },
                    { label: "Sunucu İkinci Tagı", value: "secondTag", description: "Sunucudaki 2.Tagı ayarlayabilirsiniz.", emoji: message.guild.settings.secondTag.trim() !== "" ? "✅" : "❌" },
                    { label: "Sunucunun Yasaklı Tagları", value: "bannedTags", description: "Sunucudaki Yasaklı Tagları ayarlayabilirsiniz.", emoji: message.guild.settings.bannedTags && message.guild.settings.bannedTags.length > 0 ? "✅" : "❌" },
                ]));

        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setPlaceholder("Yetkili Rolleri Güncellemek İçin Tıkla!")
                .setCustomId("authorities-setup")
                .addOptions([
                    { label: "Ayarları Görüntüle", value: "authorities-settings", description: "Sunucudaki yetkili rol ayarlarını görüntüleyebilirsiniz.", emoji: { id: "1265261055748079696" } },
                    { label: "Yetkili Rolleri", value: "staffs", description: "Sunucudaki Yetkili rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.staffs && message.guild.settings.staffs.length > 0 ? "✅" : "❌" },
                    { label: "Üst Yetkili Rolleri", value: "maxStaffs", description: "Sunucudaki Üst Yetkili rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.maxStaffs && message.guild.settings.maxStaffs.length > 0 ? "✅" : "❌" },
                    { label: "Orta Yetkili Rolleri", value: "mediumStaffs", description: "Sunucudaki Yetkili rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.mediumStaffs && message.guild.settings.mediumStaffs.length > 0 ? "✅" : "❌" },
                    { label: "Alt Yetkili Rolleri", value: "minStaffs", description: "Sunucudaki Alt Yetkili rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.minStaffs && message.guild.settings.minStaffs.length > 0 ? "✅" : "❌" },
                    { label: "Admin Rolü", value: "minAdminRole", description: "Sunucudaki Minimum admin rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.minAdminRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Yetkili Rolü", value: "minStaffRole", description: "Sunucudaki Minimum yetkili rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.minStaffRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Kurucu Rolleri", value: "ownerRoles", description: "Sunucudaki Kurucu Rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.ownerRoles && message.guild.settings.ownerRoles.length > 0 ? "✅" : "❌" },
                    { label: "Taşıma Yetkilileri", value: "transporterRoles", description: "Sunucudaki Taşıma yetkililerini ayarlayabilirsiniz.", emoji: message.guild.settings.transporterRoles && message.guild.settings.transporterRoles.length > 0 ? "✅" : "❌" },
                    { label: "Sorun Çözme Yetkilileri", value: "solvingAuth", description: "Sunucudaki Çözüm Yetkililerini ayarlayabilirsiniz.", emoji: message.guild.settings.solvingAuth && message.guild.settings.solvingAuth.length > 0 ? "✅" : "❌" },
                    { label: "Kayıt Yetkilileri", value: "registerAuth", description: "Sunucudaki Kayıt yetkililerini ayarlayabilirsiniz.", emoji: message.guild.settings.registerAuth && message.guild.settings.registerAuth.length > 0 ? "✅" : "❌" },
                    { label: "Ban Yetkilileri", value: "banAuth", description: "Sunucudaki Ban yetkililerini ayarlayabilirsiniz.", emoji: message.guild.settings.banAuth && message.guild.settings.banAuth.length > 0 ? "✅" : "❌" },
                    { label: "Jail Yetkilileri", value: "jailAuth", description: "Sunucudaki Jail yetkilileriniayarlayabilirsiniz.", emoji: message.guild.settings.jailAuth && message.guild.settings.jailAuth.length > 0 ? "✅" : "❌" },
                    { label: "Ses Mute Yetkilileri", value: "voiceMuteAuth", description: "Sunucudaki Ses Mute yetkililerini ayarlayabilirsiniz.", emoji: message.guild.settings.voiceMuteAuth && message.guild.settings.voiceMuteAuth.length > 0 ? "✅" : "❌" },
                    { label: "Chat Mute Yetkilileri", value: "chatMuteAuth", description: "Sunucudaki Chat Mute yetkililerini ayarlayabilirsiniz.", emoji: message.guild.settings.chatMuteAuth && message.guild.settings.chatMuteAuth.length > 0 ? "✅" : "❌" },
                ]));

        const row3 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setPlaceholder("Rolleri Güncellemek İçin Tıkla!")
                .setCustomId("roles-setup")
                .addOptions([
                    { label: "Ayarları Görüntüle", value: "role-settings", description: "Sunucudaki rol ayarlarını görüntüleyebilirsiniz.", emoji: { id: "1265261055748079696" } },
                    { label: "Erkek Rolleri", value: "manRoles", description: "Sunucudaki Erkek Rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.manRoles && message.guild.settings.manRoles.length > 0 ? "✅" : "❌" },
                    { label: "Kadın Rolleri", value: "womanRoles", description: "Sunucudaki Kadın Rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.womanRoles && message.guild.settings.womanRoles.length > 0 ? "✅" : "❌" },
                    { label: "Kayıtsız Rolleri", value: "unregisterRoles", description: "Sunucudaki Kayıtsız Rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.unregisterRoles && message.guild.settings.unregisterRoles.length > 0 ? "✅" : "❌" },
                    { label: "Vip Rolü", value: "vipRole", description: "Sunucudaki Vip Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.vipRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Streamer Rolü", value: "streamerRole", description: "Sunucudaki Yayıncı Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.streamerRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Katıldı Rolü", value: "meetingRole", description: "Sunucudaki Katıldı Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.meetingRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Aile Rolü", value: "familyRole", description: "Sunucudaki Aile Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.familyRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Yasaklı Tag Rolü", value: "bannedTagRole", description: "Sunucudaki Yasaklı Tag Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.bannedTagRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Şüpheli Rolü", value: "suspectedRole", description: "Sunucudaki Şüpheli Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.suspectedRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Chat Mute Rolü", value: "chatMuteRole", description: "Sunucudaki Chat Mute Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.chatMuteRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Karantina Rolü", value: "quarantineRole", description: "Sunucudaki Karantina Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.quarantineRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Reklam Rolü", value: "adsRole", description: "Sunucudaki Reklam Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.adsRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Underworld Rolü", value: "underworldRole", description: "Sunucudaki Underworld Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.underworldRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Ses Mute Rolü", value: "voiceMuteRole", description: "Sunucudaki Ses Mute Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.voiceMuteRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Etkinlik Ceza Rolü", value: "etRole", description: "Sunucudaki Etkinlik Ceza Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.etRole.trim() !== "" ? "✅" : "❌" },
                    { label: "Streamer Ceza Rolü", value: "stRole", description: "Sunucudaki Streamer Ceza Rolünü ayarlayabilirsiniz.", emoji: message.guild.settings.stRole.trim() !== "" ? "✅" : "❌" },
                ]));

        const row4 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setPlaceholder("Kanalları ve Kategorileri Güncellemek İçin Tıkla!")
                .setCustomId("channel-categories-setup")
                .addOptions([
                    { label: "Ayarları Görüntüle", value: "channel-settings", description: "Sunucudaki kanal ayarlarını görüntüleyebilirsiniz.", emoji: { id: "1265261055748079696" } },
                    { label: "Fotoğraf Kanalı", value: "photoChannels", description: "Sunucudaki Foto kanalını ayarlayabilirsiniz.", emoji: message.guild.settings.photoChannels && message.guild.settings.photoChannels.length > 0 ? "✅" : "❌" },
                    { label: "Chat Kanalı", value: "chatChannel", description: "Sunucudaki Chat kanalını ayarlayabilirsiniz.", emoji: message.guild.settings.chatChannel.trim() !== "" ? "✅" : "❌" },
                    { label: "Afk Kanalı", value: "afkChannel", description: "Sunucudaki Afk kanalını ayarlayabilirsiniz.", emoji: message.guild.settings.afkChannel.trim() !== "" ? "✅" : "❌" },
                    { label: "Kayıt Kanalı", value: "registerChannel", description: "Sunucudaki Kayıt kanalını ayarlayabilirsiniz.", emoji: message.guild.settings.registerChannel.trim() !== "" ? "✅" : "❌" },
                    { label: "Davetçi Kanalı", value: "inviterChannel", description: "Sunucudaki Davetçi kanalını ayarlayabilirsiniz.", emoji: message.guild.settings.inviterChannel.trim() !== "" ? "✅" : "❌" },
                    { label: "Public Kategorisi", value: "publicParent", description: "Sunucudaki Public kategorisini ayarlayabilirsiniz.", emoji: message.guild.settings.publicParent.trim() !== "" ? "✅" : "❌" },
                    { label: "Kayıt Kategorisi", value: "registerParent", description: "Sunucudaki Kayıt kategorisini ayarlayabilirsiniz.", emoji: message.guild.settings.registerParent.trim() !== "" ? "✅" : "❌" },
                    { label: "Secret Room Kategorisi", value: "secretRoomParent", description: "Sunucudaki Secret kategorisini ayarlayabilirsiniz.", emoji: message.guild.settings.secretRoomParent.trim() !== "" ? "✅" : "❌" },
                    { label: "Streamer Kategorisi", value: "streamerParent", description: "Sunucudaki Streamer kategorisini ayarlayabilirsiniz.", emoji: message.guild.settings.streamerParent.trim() !== "" ? "✅" : "❌" },
                    { label: "Çözüm Kategorisi", value: "solvingParent", description: "Sunucudaki Çözüm kategorisini ayarlayabilirsiniz.", emoji: message.guild.settings.solvingParent.trim() !== "" ? "✅" : "❌" },
                    { label: "Aktivite Kategorisi", value: "activityParent", description: "Sunucudaki Aktivite kategorisini ayarlayabilirsiniz.", emoji: message.guild.settings.activityParent.trim() !== "" ? "✅" : "❌" },
                ]))

        message.channel.send({ content: `Merhaba ${message.author}, sunucu kurulumu için aşağıdaki menüleri kullanabilir veya sunucu kurulumu için butonlara tıklayabilirsiniz.`, components: [row, row1, row2, row3, row4] })
    },
};