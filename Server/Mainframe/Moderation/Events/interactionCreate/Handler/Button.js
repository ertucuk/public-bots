const { PermissionsBitField: { Flags }, ActionRowBuilder, ModalBuilder, Collection, ChannelType, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, AttachmentBuilder, PermissionFlagsBits, EmbedBuilder, bold, BaseInteraction } = require("discord.js")
const { SecretRoom, Ticket, Punitive, User, Servers, Staff, Tasks } = require('../../../../../Global/Settings/Schemas');
const { roles } = require('../../../../../Global/Settings/Server/Data');
const { Canvas, loadImage } = require('canvas-constructor/skia');
const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');
const Cooldowns = new Collection();
const solverCooldown = new Collection();
const Staffs = require('../../../../../Global/Base/Staff');
const ms = require('ms');

const titles = {
    ['Male']: 'Erkek',
    ['Girl']: 'Kadın',
    ['Unregister']: 'Kayıtsız',
    ['ChangeNickname']: 'İsim Değiştirme',
    ['AutoRegister']: 'Otomatik Kayıt',
    ['Quit']: 'Sunucudan Ayrılma',
    ['Gender']: 'Cinsiyet Değiştirme'
}

const responsibleRoles = [
    'Streamer Sorumlusu',
    'Ban/Ceza Sorumlusu',
    'Public Sorumlusu',
    'Yetkili Alım Sorumlusu',
    'Etkinlik Sorumlusu',
    'Sorun Çözücü',
    'Oryantasyon Sorumlusu',
    'Return Sorumlusu',
    'Chat Sorumlusu',
    'Rol Denetim Sorumlusu'
];

module.exports.run = async (client, button = BaseInteraction) => {
    const { customId: ID, guildId, channelId, message } = button;

    const guild = client.guilds.cache.get(guildId);
    const channel = client.channels.cache.get(channelId);
    const secretRoom = await SecretRoom.findOne({ id: button.channel.id });

    if (ID == 'emoji-setup') {

        const memberID = message.content.match(/<@(\d+)>/);
        const member = guild.members.cache.get(memberID ? memberID[1] : null);
        const user = guild.members.cache.get(button.user.id);

        if (member && member.user.id !== user.id) {
            return button.reply({
                content: `${client.getEmoji("mark")} Bu butonu kullanamazsın.`,
                ephemeral: true
            });
        }

        const emojis = [
            { name: "check", url: "https://cdn.discordapp.com/emojis/1040686189939789975.gif?size=80&quality=lossless" },
            { name: "mark", url: "https://cdn.discordapp.com/emojis/1040686177092644884.gif?size=80&quality=lossless" },
            { name: "point", url: "https://cdn.discordapp.com/emojis/1057358625972178974.webp?size=40&quality=lossless" },
            { name: "Start", url: "https://cdn.discordapp.com/emojis/1222494259643416647.webp?size=40&quality=lossless" },
            { name: "Mid", url: "https://cdn.discordapp.com/emojis/1222494268401123380.webp?size=40&quality=lossless" },
            { name: "End", url: "https://cdn.discordapp.com/emojis/1247840233765076993.webp?size=80&quality=lossless" },
            { name: "EmptyStart", url: "https://cdn.discordapp.com/emojis/1222494258305699922.webp?size=40&quality=lossless" },
            { name: "EmptyMid", url: "https://cdn.discordapp.com/emojis/1222494261954482247.webp?size=40&quality=lossless" },
            { name: "EmptyEnd", url: "https://cdn.discordapp.com/emojis/1222494270146089031.webp?size=40&quality=lossless" },
            { name: "voice", url: "https://cdn.discordapp.com/emojis/1230655387733327944.webp?size=40&quality=lossless" },
            { name: "message", url: "https://cdn.discordapp.com/emojis/1230655386483298304.webp?size=40&quality=lossless" },
            { name: "exclamation", url: "https://cdn.discordapp.com/emojis/1247865181841657897.webp?size=80&quality=lossless" },
            { name: "up", url: "https://cdn.discordapp.com/emojis/947134506488459274.gif?size=80&quality=lossless"},
            { name: "down", url: "https://cdn.discordapp.com/emojis/947134506672996382.gif?size=80&quality=lossless"}
        ]

        emojis.forEach(async (x) => {
            if (button.guild.emojis.cache.find((e) => x.name === e.name)) global.emojidb.set(x.name, button.guild.emojis.cache.find((e) => x.name === e.name).toString());
            if (button.guild.emojis.cache.find((e) => x.name === e.name)) return;
            const emoji = await button.guild.emojis.create({ attachment: x.url, name: x.name });
            await global.emojidb.set(x.name, x.url.includes("gif") ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`);
            button.channel.send({ content: `\`${x.name}\` isimli emoji oluşturuldu! (${emoji.toString()})`, ephemeral: true })
        })
    }

    if (ID == 'channel-setup') {

        const memberID = message.content.match(/<@(\d+)>/);
        const member = guild.members.cache.get(memberID ? memberID[1] : null);
        const user = guild.members.cache.get(button.user.id);

        if (member && member.user.id !== user.id) {
            return button.reply({
                content: `${client.getEmoji("mark")} Bu butonu kullanamazsın.`,
                ephemeral: true
            });
        }

        const logsCategory = await button.guild.channels.create({
            name: `${button.guild.name} | Logs`,
            type: ChannelType.GuildCategory,
            position: 99,
            permissionOverwrites: [
                {
                    id: button.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]
        })

        const loadingMessage = await button.reply(`Kanallar oluşturuluyor...`)
        const channelNames = Object.values(client.logs)

        await Promise.all(
            channelNames.map(async (name) => {
                return await button.guild.channels.create({
                    name,
                    type: ChannelType.GuildText,
                    parent: logsCategory.id,
                    permissionOverwrites: [
                        {
                            id: button.guild.roles.everyone,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })
            })
        ).finally(() => loadingMessage.edit('Kanallar oluşturuldu.'));
    }

    if (ID == 'role-setup') {

        const memberID = message.content.match(/<@(\d+)>/);
        const member = guild.members.cache.get(memberID ? memberID[1] : null);
        const user = guild.members.cache.get(button.user.id);

        if (member && member.user.id !== user.id) {
            return button.reply({
                content: `${client.getEmoji("mark")} Bu butonu kullanamazsın.`,
                ephemeral: true
            });
        }

        const data = roles
        const loadingMessage = await button.reply(`Roller oluşturuluyor...`)
        for (let index = 0; index < data.length; index++) {
            let element = roles[index];
            await button.guild.roles.create({
                name: element.name,
                color: element.color
            })
        }

        loadingMessage.edit({ content: `Menü için gerekli Rollerin kurulumu başarıyla tamamlanmıştır.` })
    }

    if (ID == 'respons-setup') {

        const memberID = message.content.match(/<@(\d+)>/);
        const member = guild.members.cache.get(memberID ? memberID[1] : null);
        const user = guild.members.cache.get(button.user.id);

        if (member && member.user.id !== user.id) {
            return button.reply({
                content: `${client.getEmoji("mark")} Bu butonu kullanamazsın.`,
                ephemeral: true
            });
        }

        button.reply({ content: `Yakında aktif olacak. Bu yüzden **.sorumlulukpanel** kullan.`, ephemeral: true })
    }

    if (ID == 'secretroom') {

        const secretRoom = await SecretRoom.findOne({ ownerId: button.user.id });
        if (secretRoom) return button.reply({ content: 'Zaten bir kanalınız bulunmakta. Eğer bunun bir hata olduğunu düşünüyorsanız kurucularla iletişime geçin.', ephemeral: true });

        const createRoom = new ModalBuilder()
            .setTitle('Özel Oda Oluştur')
            .setCustomId('createRoomm')
            .setComponents(
                new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("channelName").setLabel("Oda ismini giriniz.").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("channelLimit").setLabel("Limiti giriniz.").setStyle(TextInputStyle.Short)),
            );

        button.showModal(createRoom)
    };

    if (ID == 'lock') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)
        await lockChannel.permissionOverwrites.create(button.guild.roles.everyone, { 1048576: false })
        button.reply({ content: `${client.getEmoji('check')} Kanalınız başarıyla kilitlendi.`, ephemeral: true })
    }

    if (ID == 'unlock') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)
        await lockChannel.permissionOverwrites.create(button.guild.roles.everyone, { 1048576: true })
        button.reply({ content: `${client.getEmoji('check')} Kanalınız başarıyla kilidi açıldı.`, ephemeral: true })
    }

    if (ID == 'invisible') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)
        await lockChannel.permissionOverwrites.create(button.guild.roles.everyone, { 1024: false })
        button.reply({ content: `${client.getEmoji('check')} Kanalınız başarıyla görünmez yapıldı.`, ephemeral: true })
    }

    if (ID == 'visible') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)
        await lockChannel.permissionOverwrites.create(button.guild.roles.everyone, { 1024: true })
        button.reply({ content: `${client.getEmoji('check')} Kanalınız başarıyla görünür yapıldı.`, ephemeral: true })
    }

    if (ID == 'adduser') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)
        button.reply({ content: `Ekleyeceğiniz kullanıcıları menüden seçin.`, components: [new ActionRowBuilder().addComponents(new UserSelectMenuBuilder().setCustomId('AddUser').setPlaceholder('Kullanıcı ara.').setMinValues(1).setMaxValues(20))], ephemeral: true })
    }

    if (ID == 'removeuser') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)

        const members = lockChannel.permissionOverwrites.cache
            .filter(x => button.guild.members.cache.get(x.id) && x.id !== secretRoom.ownerId)
            .map(x => {
                const username = button.guild.members.cache.get(x.id).user.username;
                return {
                    label: username,
                    value: x.id,
                };
            });

        if (members.length === 0) return button.reply({ content: 'Kanalınızda çıkarılacak kullanıcı bulunmamaktadır.', ephemeral: true });

        const membersArray = [...members];

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('RemoveUser')
                    .setPlaceholder('Kullanıcı ara.')
                    .setOptions(membersArray.slice(0, membersArray.length))
                    .setMinValues(membersArray.length)
                    .setMaxValues(membersArray.length)
            )

            button.reply({ content: 'Aşağıdan çıkarmak istediğiniz kullanıcıları seçin.', components: [row], ephemeral: true });
    }

    if (ID == 'giveowner') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)
        button.reply({ content: `Sahipliği vermek istediğiniz kullanıcıyı menüden seçin.`, components: [new ActionRowBuilder().addComponents(new UserSelectMenuBuilder().setCustomId('GiveOwner').setPlaceholder('Kullanıcı ara.').setMinValues(1).setMaxValues(1))], ephemeral: true })
    }

    if (ID == 'edit') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)

        let modal = new ModalBuilder()
            .setTitle('Kanalı Düzenle')
            .setCustomId('editchannel')
            .setComponents(
                new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("ChannelName").setLabel("Yeni oda ismini giriniz.").setPlaceholder(`${lockChannel.name}`).setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("ChannelLimit").setLabel("Yeni limiti giriniz.").setPlaceholder(`${lockChannel.userLimit}`).setStyle(TextInputStyle.Short).setRequired(true)),
            );

        button.showModal(modal)
    }

    if (ID == 'requestowner') {
        const secretRoom = await SecretRoom.findOne({ id: button.channel.id });
        if (secretRoom.ownerId === button.user.id) return button.reply({ content: 'Zaten kanalın sahibisin.', ephemeral: true });
        button.deferUpdate({ ephemeral: true })
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)

        let msg = await button.channel.send({ content: `Hey! <@${secretRoom.ownerId}>, ${button.user} kanalın sahipliğini almak istiyor. Kabul ediyor musunuz?`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('accept').setLabel('Kabul Et').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('decline').setLabel('Reddet').setStyle(ButtonStyle.Danger))] })
        var filter = (b) => b.user.id === secretRoom.ownerId;
        var collector = msg.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async (b) => {
            await b.deferUpdate();
            if (b.customId == 'accept') {
                await SecretRoom.updateOne({ id: button.channel.id }, { $set: { ownerId: button.user.id } }, { upsert: true });
                if (msg) msg.delete().catch(err => { });
                msg.channel.send({ content: `${client.getEmoji('check')} Kanalın sahipliği başarıyla <@${button.user.id}> kullanıcısına verildi.` })
            }
            if (b.customId == 'decline') {
                if (msg) msg.delete().catch(err => { });
                msg.channel.send({ content: `${client.getEmoji('mark')} Kanalın sahibi isteği reddettiği için kanalın sahipliği <@${button.user.id}> kullanıcısına verilemedi.` })
            }
        })
    }

    if (ID == 'deletechannel') {
        if (secretRoom.ownerId !== button.user.id) return button.reply({ content: 'Bu kanal size ait olmadığı için bu işlemi yapamazsınız.', ephemeral: true });
        const lockChannel = button.guild.channels.cache.get(secretRoom.id)
        lockChannel.delete()
        await SecretRoom.deleteMany({ ownerId: button.user.id });
    }

    ///////////////////////////////////////////////////////// USER-PANEL /////////////////////////////////////////////////////////

    if (ID == 'userPanel-I') {
        await button.reply({ content: `Sunucuya Katılma Tarihiniz: <t:${Math.floor(button.member.joinedTimestamp / 1000)}:R> (<t:${Math.floor(button.member.joinedTimestamp / 1000)}>)`, ephemeral: true })
    }

    if (ID == 'userPanel-II') {
        await button.reply({ content: `Hesabınızın açılış tarihi: <t:${Math.floor(button.member.user.createdTimestamp / 1000)}:R> (<t:${Math.floor(button.member.user.createdTimestamp / 1000)}>)`, ephemeral: true })
    }

    if (ID == 'userPanel-III') {
        await button.reply({ content: `Üzerinde bulunan rollerin listesi;\n${(await button.guild.members.cache.get(button.member.id).roles.cache.filter(a => a.name !== '@everyone').map(a => a).join(' ') ? await button.guild.members.cache.get(button.member.id).roles.cache.filter(a => a.name !== '@everyone').map(a => a).join(', ') : 'Hiç yok.')}`, ephemeral: true });
    }

    if (ID == 'userPanel-IV') {

        const document = await User.findOne({ userID: button.member.id });
        if (!document) {
            button.reply({ content: `Davet veriniz bulunmuyor.`, ephemeral: true })
            return;
        }

        const invitingUsers = await User.find({ UserInviter: button.member.id });
        const dailyTotal = invitingUsers.filter((inv) => button.guild.members.cache.has(inv.userID) && 1000 * 60 * 60 * 24 >= Date.now() - button.guild.members.cache.get(inv.userID).joinedTimestamp).length;
        const weeklyTotal = invitingUsers.filter((inv) => button.guild.members.cache.has(inv.userID) && 1000 * 60 * 60 * 24 * 7 >= Date.now() - button.guild.members.cache.get(inv.userID).joinedTimestamp).length;

        const embed = new EmbedBuilder({
            color: client.random(),
            author: { name: button.member.username, iconURL: button.member.displayAvatarURL({ forceStatic: true }) },
            description: `Toplam ${bold(document.NormalInvites)} davetiniz bulunuyor. (${bold(document.NormalInvites)} normal, ${bold(document.LeaveInvites)} ayrılan, ${bold(dailyTotal)} günlük, ${bold(weeklyTotal)} haftalık)`,
        })

        button.reply({ embeds: [embed], ephemeral: true });
    }

    if (ID == 'userPanel-V') {

        const data = await Punitive.find({ Member: button.member.id, Active: true }).sort({ Date: -1 });
        if (data.length === 0) return button.reply({ content: `Aktif cezanız bulunmamaktadır.`, ephemeral: true });

        let datas = data.map((x) => `<@${x.Staff}> tarafından **${moment(x.Date).format('LLL')}**'da işlenen __"#${x.No}"__ numaralı __"${x.Type}"__ türündeki cezalandırman \`${x.Duration ? moment.duration(x.Duration - Date.now()).format("H [Saat], m [Dakika] s [Saniye]") : "süresiz."}dir.\``).join('\n');

        await button.reply({ content: datas, ephemeral: true });
    }

    if (ID == 'userPanel-VI') {
        await button.deferReply({ ephemeral: true });
        const data = await Punitive.find({ Member: button.member.id }).sort({ Date: -1 });
        
        if (data.length === 0) return button.editReply({ content: `Hiç cezanız bulunmuyor.`, ephemeral: true });
        
        let page = 1;
        const totalData = Math.ceil(data.length / 1);
        const staff = await client.users.fetch(data[0].Staff);
        const mappedData = data.map((x) => 
            `\`\`\`ansi\n[2;36mCeza: ${x.Type} - ${x.Active ? "Aktif" : "Bitmiş"}[0m[2;36m[0m\nYetkili: @${staff.username} - ${x.Staff}\nTarih: ${moment(x.Date).fromNow()}\nBitiş: ${x.Duration ? moment(x.Duration).fromNow() : "Kalıcı"}\nCeza Sebebi: ${x.Reason}\`\`\``);

        const embed = new EmbedBuilder({ description: mappedData.slice(0, 1).join('\n') });
        if (data.length < 2) {
            button.editReply({ embeds: [embed] });
        } else {
            const msg = await button.editReply({
                embeds: [embed.setFooter({ text: `Sayfa: ${page}/${totalData}`, iconURL: button.guild.iconURL({ dynamic: true }) })],
                components: [client.getButton(page, totalData)]
            });

            const filter = (i) => i.user.id === button.member.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                await i.deferUpdate();
                if (i.customId === 'first') page = 1;
                if (i.customId === 'previous') page -= 1;
                if (i.customId === 'next') page += 1;
                if (i.customId === 'last') page = totalData;

                const embed = new EmbedBuilder({
                    color: client.random(),
                    footer: { text: `Sayfa: ${page}/${totalData}`, iconURL: button.guild.iconURL({ dynamic: true }) },
                    description: mappedData.slice(page == 1 ? 0 : page * 1 - 1, page * 1).join('\n')
                })
               
                button.editReply({
                    embeds: [embed],
                    components: [client.getButton(page, totalData)]
                });
            });
        }
    }

    if (ID == 'userPanel-VII') {

        if (!button.member.premiumSince && !button.guild.settings.ownerRoles.some(x => button.member.roles.cache.has(x)) && !button.member.permissions.has(Flags.Administrator)) return button.reply({ content: `Bu komutu kullanabilmek için sunucuya takviye yapmış olmanız gerekmektedir.`, ephemeral: true });
      
        const modal = new ModalBuilder()
            .setTitle('Booster İsim Değiştirme')
            .setCustomId('changeNickname')
            .setComponents(
                new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("boost").setLabel("İsim:").setPlaceholder(`Utku`).setMinLength(2).setMaxLength(30).setStyle(TextInputStyle.Short).setRequired(true)),
            );

        button.showModal(modal)
    }

    if (ID == 'userPanel-VIII') {

        await button.deferReply({ ephemeral: true });
        const document = await User.findOne({ userID: button.member.id });
        if (document && document.Names) {
            if (document.Names.length === 0) return button.editReply({ content: `Hiç isim bilginiz bulunmuyor.`, ephemeral: true });

            let page = 1;
            const totalData = Math.ceil(document.Names.length / 10);
            const mappedData = document && document.Names ? document.Names.map((x) => `[<t:${Math.floor(x.Date / 1000)}:R>] ${x.Name} - ${bold(titles[x.Type])}`) : "";

            const embed = new EmbedBuilder({
                color: client.random(),
                description: `Toplamda **${document.Names.length || 0}** isim kayıdınız bulundu.\n\n${mappedData.slice(0, 10).join('\n')}`
            });

            const msg = await button.editReply({
                embeds: [embed],
                components: document.Names.length >= 10 ? [client.getButton(page, totalData)] : []
            })

            if (10 > document.Names.length) return;

            const filter = (i) => i.user.id === button.member.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                await i.deferUpdate();
                if (i.customId === 'first') page = 1;
                if (i.customId === 'previous') page -= 1;
                if (i.customId === 'next') page += 1;
                if (i.customId === 'last') page = totalData;

                const embed = new EmbedBuilder({
                    color: client.random(),
                    description: `Toplamda **${document.Names.length || 0}** isim kaydınız bulundu.\n\n${mappedData.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join('\n')}`
                });

                button.editReply({
                    embeds: [embed],
                    components: [client.getButton(page, totalData)]
                });
            });
        } else {
            button.editReply({ content: `Hiç isim bilginiz bulunmuyor.`, ephemeral: true });
        }
    }

    if (ID == 'userPanel-IX') {

        const data = await User.findOne({ userID: button.member.id });
        if (!data) return button.reply({ content: `Hiç veriniz bulunmuyor.`, ephemeral: true });

        const messageDays = data.Messages || {};
        const DailyMessage = Object.keys(messageDays).filter((d) => 1 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + messageDays[currentDay].total, 0);
        const MonthlyMessage = Object.keys(messageDays).filter((d) => 30 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + messageDays[currentDay].total, 0);
        const TotalMessage = Object.keys(messageDays).reduce((totalCount, currentDay) => totalCount + messageDays[currentDay].total, 0);

        const voiceDays = data.Voices || {};
        const dailyVoice = Object.keys(voiceDays).filter((d) => 1 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + voiceDays[currentDay].total, 0);
        const monthlyVoice = Object.keys(voiceDays).filter((d) => 30 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + voiceDays[currentDay].total, 0);
        const totalVoice = Object.keys(voiceDays).reduce((totalCount, currentDay) => totalCount + voiceDays[currentDay].total, 0);

        const streamDays = data.Streams || {};
        const dailyStream = Object.keys(streamDays).filter((d) => 1 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + streamDays[currentDay].total, 0);
        const monthlyStream = Object.keys(streamDays).filter((d) => 30 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + streamDays[currentDay].total, 0);
        const totalStream = Object.keys(streamDays).reduce((totalCount, currentDay) => totalCount + streamDays[currentDay].total, 0);

        const cameraDays = data.Cameras || {};
        const dailyCamera = Object.keys(cameraDays).filter((d) => 1 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + cameraDays[currentDay].total, 0);
        const monthlyCamera = Object.keys(cameraDays).filter((d) => 30 >= data.Days - Number(d)).reduce((totalCount, currentDay) => totalCount + cameraDays[currentDay].total, 0);
        const totalCamera = Object.keys(cameraDays).reduce((totalCount, currentDay) => totalCount + cameraDays[currentDay].total, 0);

        const canvas = new Canvas(1145, 337);

        const backgroundBuffer = await loadImage('https://i.hizliresim.com/n0dejs6.png');
        canvas.printImage(backgroundBuffer, 0, 0);

        const avatarBuffer = await loadImage(button.member.displayAvatarURL({ extension: 'png', size: 4096 }));
        canvas.printRoundedImage(avatarBuffer, 19, 18, 65, 65, 20);

        canvas.setTextFont('normal 25px Kanit');
        canvas.setColor("#ffffff");
        canvas.printText(button.member.displayName, 95, 60)

        canvas.setTextSize(20);
        canvas.setTextAlign('center');
        canvas.printText(`${data.Days} günlük veri`, 995, 46);

        canvas.setTextSize(15);

        canvas.printText(formatDurations(dailyVoice || 0), 258, 143);
        canvas.printText(`${DailyMessage} mesaj`, 258, 195);
        canvas.printText(formatDurations(dailyStream || 0), 258, 243);
        canvas.printText(formatDurations(dailyCamera || 0), 258, 293);

        canvas.printText(formatDurations(monthlyVoice || 0), 639, 143);
        canvas.printText(`${MonthlyMessage} mesaj`, 639, 195);
        canvas.printText(formatDurations(monthlyStream || 0), 639, 243);
        canvas.printText(formatDurations(monthlyCamera || 0), 639, 293);

        canvas.printText(formatDurations(totalVoice || 0), 1018, 143);
        canvas.printText(`${TotalMessage} mesaj`, 1018, 195);
        canvas.printText(formatDurations(totalStream || 0), 1018, 243);
        canvas.printText(formatDurations(totalCamera || 0), 1018, 293);

        const attachment = new AttachmentBuilder(canvas.png(), { name: 'weekly-stats.png' });

        await button.reply({ files: [attachment], ephemeral: true });
    }

    ///////////////////////////////////////////////////////// USER-PANEL /////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////// PENAL-PANEL /////////////////////////////////////////////////////////

    if (ID == 'cezaPanel-I') {

        await button.deferReply({ ephemeral: true });
        const data = await Punitive.find({ Member: button.member.id }).sort({ Date: -1 });
        if (data.length === 0) return button.editReply({ content: `Hiç cezanız bulunmuyor.`, ephemeral: true });

        let Page = 1;
        const totalPages = Math.ceil(data.length / 1);
        const staff = await client.users.fetch(data[0].Staff);
        let lıst = data.map((x) => `\`\`\`ansi\n[2;36mCeza: ${x.Type} - ${x.Active ? "Aktif" : "Bitmiş"}[0m[2;36m[0m\nYetkili: @${staff.username} - ${x.Staff}\nTarih: ${moment(x.Date).fromNow()}\nBitiş: ${x.Duration ? moment(x.Duration).fromNow() : "Kalıcı"}\nCeza Sebebi: ${x.Reason}\`\`\``);
        if (data.length < 2) {
            button.editReply({ embeds: [new global.VanteEmbed().setDescription(lıst.slice(Page == 1 ? 0 : Page * 1 - 1, Page * 1).join('\n'))] })
        } else if (data.length >= 2) {
            var msg = await button.editReply({ embeds: [new global.VanteEmbed().setFooter({ text: `Sayfa: ${Page}/${totalPages}`, iconURL: button.guild.iconURL({ dynamic: true }) }).setDescription(lıst.slice(Page == 1 ? 0 : Page * 1 - 1, Page * 1).join('\n'))], components: data.length >= 2 ? [client.getButton(Page, totalPages)] : [] })
        }

        if (msg) {
            const filter = (i) => i.user.id === button.member.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 })

            collector.on('collect', async i => {

                await i.deferUpdate();
                if (i.customId === 'first') Page = 1;
                if (i.customId === 'previous') Page -= 1;
                if (i.customId === 'next') Page += 1;
                if (i.customId === 'last') Page = totalPages;

                button.editReply({ embeds: [new global.VanteEmbed().setFooter({ text: `Sayfa: ${Page}/${totalPages}`, iconURL: button.guild.iconURL({ dynamic: true }) }).setDescription(lıst.slice(Page == 1 ? 0 : Page * 1 - 1, Page * 1).join('\n'))], components: [client.getButton(Page, totalPages)] });
            })
        }
    }

    if (ID == 'cezaPanel-II') {

        const data = await Punitive.find({ Member: button.member.id, Active: true }).sort({ Date: -1 });
        if (data.length === 0) return button.reply({ content: `Aktif cezanız bulunmamaktadır.`, ephemeral: true });

        let datas = data.map((x) => `<@${x.Staff}> tarafından **${moment(x.Date).format('LLL')}**'da işlenen __"#${x.No}"__ numaralı __"${x.Type}"__ türündeki cezalandırman \`${x.Duration ? moment.duration(x.Duration - Date.now()).format("H [Saat], m [Dakika] s [Saniye]") : "süresiz."}dir.\``).join('\n');

        await button.reply({ content: datas, ephemeral: true });

    }

    if (ID == 'cezaPanel-III') {

        let check = Date.now() - button.member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 7;

        if (check) {
            button.reply({ content: `Hesabınız 7 günden önce açıldığı için şüpheli kategorisinden çıkmaya uygun değildir.`, ephemeral: true });
        } else {
            if (!button.member.roles.cache.has(button.guild.settings.suspectedRole)) return button.reply({ content: `Şüpheli hesap değilsiniz!`, ephemeral: true })
            button.member.setRoles(button.guild.settings.unregisterRoles).catch(err => { });
            button.member.send({ content: `Hesabınız şüpheli hesap kategorisinden çıkarıldı.` }).catch(err => { });
            button.reply({ content: `Hesabınız şüpheli hesap kategorisinden çıkarıldı.`, ephemeral: true });
        }
    }

    if (ID == 'event-role') {

        const etkinlik = await button.guild.roles.cache.find(x => x.name.includes("Etkinlik Duyuru"))
        if (button.member.roles.cache.has(etkinlik.id)) {
            button.member.roles.remove(etkinlik.id).catch(err => { });
            button.reply({ content: `Başarıyla <@&${etkinlik.id}> rolü üzerinizden alındı.`, ephemeral: true })
        } else {
            button.member.roles.add(etkinlik.id).catch(err => { });
            button.reply({ content: `Başarıyla <@&${etkinlik.id}> rolü üzerinize verildi.`, ephemeral: true })
        }

    }

    if (ID == 'giveaway-role') {

        const cekilis = await button.guild.roles.cache.find(x => x.name.includes("Cekilis Duyuru"))
        if (button.member.roles.cache.has(cekilis.id)) {
            button.member.roles.remove(cekilis.id).catch(err => { });
            button.reply({ content: `Başarıyla <@&${cekilis.id}> rolü üzerinizden alındı.`, ephemeral: true })
        } else {
            button.member.roles.add(cekilis.id).catch(err => { });
            button.reply({ content: `Başarıyla <@&${cekilis.id}> rolü üzerinize verildi.`, ephemeral: true })
        }

    }

    if (ID == 'fastlogin') {

        if (button.guild.settings.fastLogin == false) return button.reply({ content: `Hızlı giriş sistemi şuan kapalı olduğu için işlemizine devam edilemiyor.`, ephemeral: true });

        let ButtonCooldowns = Cooldowns.get(button.customId);
        if (!ButtonCooldowns) {
            Cooldowns.set(button.customId, new Collection());
            ButtonCooldowns = Cooldowns.get(button.customId);
        }

        const now = Date.now();
        const userCooldown = ButtonCooldowns.get(button.user.id);

        if (userCooldown) {
            const expirationTime = userCooldown + 1000 * 60 * 5;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return button.reply({ content: `Bu butonu tekrar kullanabilmek için **${timeLeft.toFixed(1)}** saniye beklemelisin.`, ephemeral: true });
            }
        } else {
            ButtonCooldowns.set(button.user.id, now);
            setTimeout(() => ButtonCooldowns.delete(button.user.id), 1000 * 60 * 5);
        }

        if (Date.now() - button.member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 7) {
            button.reply({ content: `Hesabınız 7 günden önce açıldığı için sizi teyit kanallarına yönlendiremiyorum.`, ephemeral: true });
            return;
        } else {
            button.member.setRoles(button.guild.settings.registerRoles).catch(err => { });
            if (button.guild.settings.public) button.member.setNickname(`${button.member.user.displayName.includes(button.guild.settings.serverTag) ? "" : (button.guild.settings.secondTag || "")} İsim | Yaş`).catch(err => button.reply({ content: global.cevaplar.isimapi, ephemeral: true }));
            else button.member.setNickname(`${button.guild.settings.secondTag} İsim | Yaş`).catch(err => button.reply({ content: global.cevaplar.isimapi, ephemeral: true }));
            button.reply({ content: `Doğrulama başarılı! Teyit kanallarına yönlendiriliyorsunuz.`, ephemeral: true });
        }
    }

    if (ID == 'streamerpanel') {
        if (button.member.roles.cache.has(button.guild.settings.streamerRole)) return button.reply({ content: `Zaten streamer rolünüz bulunmakta.`, ephemeral: true });

        const modal = new ModalBuilder({
            customId: "streamer-appeal",
            title: "Streamer Başvuru Paneli",
            components: [
                new ActionRowBuilder({
                    components: [
                        new TextInputBuilder({
                            customId: "speedTest",
                            label: "SpeedTest Result URL",
                            placeholder: "https://www.speedtest.net/result/13042119778",
                            style: TextInputStyle.Short
                        })
                    ]
                })
            ]
        })

        button.showModal(modal);
    }

    if (ID == 'register') {

        const Users = await User.findOne({ userID: button.member.id })

        let ChatChannel = button.member.guild.channels.cache.get(button.guild.settings.chatChannel)
        let WelcomeLog = await client.getChannel("register-log", button)

        if (Users && Users.Gender == "Male") {
            button.reply({ content: `Başarıyla **Erkek** olarak kayıt oldunuz.`, ephemeral: true });
            if (ChatChannel) ChatChannel.send(`:tada: Merhaba ${button.member}! Tekrar aramıza hoş geldin!`).then(s => { setTimeout(() => { s.delete().catch(err => { }) }, 10000) })
            if (WelcomeLog) WelcomeLog.send({ embeds: [new EmbedBuilder().setDescription(`${button.member} isimli üyenin daha önceden verisi olduğu için otomatik olarak sistem tarafından <t:${Math.floor(Date.now() / 1000)}:R> **Erkek** olarak kayıt edildi.`)] })
            await User.updateOne({ userID: button.member.id }, { $push: { "Names": { Name: Users.userName, Reason: `Otomatik Kayıt`, Type: "AutoRegister", Role: button.guild.settings.manRoles.map(x => button.member.guild.roles.cache.get(x)).join(","), Date: Date.now() } } }, { upsert: true })
            await button.member.setNickname(`${button.member.user.displayName.includes(button.guild.settings.serverTag) ? "" : (button.guild.settings.secondTag || "")} ${Users.userName}`).catch(err => console.log(global.cevaplar.isimapi));
            await button.member.setRoles(button.guild.settings.manRoles).catch(err => { });
        } else if (Users && Users.Gender == 'Girl') {
            button.reply({ content: `Başarıyla **Kadın** olarak kayıt oldunuz.`, ephemeral: true });
            if (ChatChannel) ChatChannel.send(`:tada: Merhaba ${button.member}! Tekrar aramıza hoş geldin!`).then(s => { setTimeout(() => { s.delete().catch(err => { }) }, 10000) })
            if (WelcomeLog) WelcomeLog.send({ embeds: [new EmbedBuilder().setDescription(`${button.member} isimli üyenin daha önceden verisi olduğu için otomatik olarak sistem tarafından <t:${Math.floor(Date.now() / 1000)}:R> **Kadın** olarak kayıt edildi.`)] })
            await User.updateOne({ userID: button.member.id }, { $push: { "Names": { Name: Users.userName, Reason: `Otomatik Kayıt`, Type: "AutoRegister", Role: button.guild.settings.womanRoles.map(x => button.member.guild.roles.cache.get(x)).join(","), Date: Date.now() } } }, { upsert: true })
            await button.member.setNickname(`${button.member.user.displayName.includes(button.guild.settings.serverTag) ? "" : (button.guild.settings.secondTag || "")} ${Users.userName}`).catch(err => console.log(global.cevaplar.isimapi));
            await button.member.setRoles(button.guild.settings.womanRoles).catch(err => { });
        } else {
            button.reply({ content: `Kayıt veriniz bulunmamaktadır bu yüzden kayıt yetkilileri tarafından kayıt olmanız gerekmektedir.`, ephemeral: true });
        }
    }

    if (ID == 'auth-support') {

        if (button.guild.settings.staffs.some(b => button.member.roles.cache.has(b))) return button.reply({ content: `Zaten yetkili rolünüz bulunmakta.`, ephemeral: true });

        const modal = new ModalBuilder({
            customId: "auth-support-appeal",
            title: "Yetkili Başvuru",
        })

        const inputs = [
            new TextInputBuilder({
                customId: "how-time",
                label: "GÜNLÜK KAÇ SAAT AKTİF OLABİLİRSİN?",
                placeholder: "ÖRN: 5 Saat",
                style: TextInputStyle.Short
            }),

            new TextInputBuilder({
                customId: 'history-auth',
                label: 'DAHA ÖNCE YETKİLİ OLDUNUZ MU?',
                placeholder: 'ÖRN: Evet, x Sunucuda yetkili oldum.',
                style: TextInputStyle.Paragraph
            }),

            new TextInputBuilder({
                customId: 'communacation',
                label: 'İNSANLARLA İLETİŞİMİNİZ NASIL?',
                placeholder: 'ÖRN: İyi, kötü, orta',
                style: TextInputStyle.Short
            }),

            new TextInputBuilder({
                customId: 'why-auth',
                label: 'NEDEN YETKİLİ OLMAK İSTİYORSUNUZ?',
                placeholder: 'ÖRN: Çünkü sunucuya katkı sağlamak istiyorum.',
                style: TextInputStyle.Paragraph
            }),
        ]


        const rows = inputs.map((input) => new ActionRowBuilder().addComponents(input))

        modal.addComponents(...rows);
        button.showModal(modal);
    }

    if (ID == 'selectAvatar') {

        const bot = await button.guild.members.cache.get(message.embeds[0].description.match(/<@(\d+)>/) ? message.embeds[0].description.match(/<@(\d+)>/)[1] : null)
        if (!bot) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id)
        if (!Client) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const load = await button.reply({
            content: `Botun yeni avatarını girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsin..`,
            ephemeral: true
        })

        const filter = (m) => m.author.id === button.user.id;
        const collector = button.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(client.getEmoji('check'));
                return collector.stop()
            }

            const avatar = msg.attachments.first() ? msg.attachments.first().url : null
            if (!avatar) {
                load.edit({ content: `${client.getEmoji('mark')} Lütfen bir avatar yükleyin.`, ephemeral: true })
                if (msg) msg.react(client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(client.getEmoji('check'));
            await client.updateClient(Client.token, avatar, 'avatar').then(async () => {
                load.edit({
                    content: `${client.getEmoji('check')} Botunuzun profil resmi başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }

    if (ID == 'selectName') {

        const bot = await button.guild.members.cache.get(message.embeds[0].description.match(/<@(\d+)>/) ? message.embeds[0].description.match(/<@(\d+)>/)[1] : null)
        if (!bot) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id)
        if (!Client) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const load = await button.reply({
            content: `Botun yeni adını girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsin..`,
            ephemeral: true
        })

        const filter = (m) => m.author.id === button.user.id;
        const collector = button.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(client.getEmoji('check'));
                return collector.stop()
            }

            const name = msg.content
            if (!name) {
                load.edit({ content: `${client.getEmoji('mark')} Lütfen bir isim girin.`, ephemeral: true })
                if (msg) msg.react(client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(client.getEmoji('check'));
            await client.updateClient(Client.token, name, 'username').then(async () => {
                load.edit({
                    content: `${client.getEmoji('check')} Botunuzun adı başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }

    if (ID == 'selectBio') {

        const bot = await button.guild.members.cache.get(message.embeds[0].description.match(/<@(\d+)>/) ? message.embeds[0].description.match(/<@(\d+)>/)[1] : null)
        if (!bot) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id)
        if (!Client) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const load = await button.reply({
            content: `Botun yeni biyografisini girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsin..`,
            ephemeral: true
        })

        const filter = (m) => m.author.id === button.user.id;
        const collector = button.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(client.getEmoji('check'));
                return collector.stop()
            }

            const bio = msg.content
            if (!bio) {
                load.edit({ content: `${client.getEmoji('mark')} Lütfen bir biyografi girin.`, ephemeral: true })
                if (msg) msg.react(client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(client.getEmoji('check'));
            await client.updateClient(Client.token, bio, 'biography').then(async () => {
                load.edit({
                    content: `${client.getEmoji('check')} Botunuzun biyografisi başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }

    if (ID == 'selectBanner') {
        const bot = await button.guild.members.cache.get(message.embeds[0].description.match(/<@(\d+)>/) ? message.embeds[0].description.match(/<@(\d+)>/)[1] : null)
        if (!bot) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const Client = global.ertuBots.Main.find((client) => client.id === bot.id) || global.ertuBots.Welcome.find((client) => client.id === bot.id)
        if (!Client) return button.reply({ content: `${client.getEmoji('mark')} Bot bulunamadı!`, ephemeral: true })

        const load = await button.reply({
            content: `Botun yeni bannerını girin. İşleminizi **60 saniye** içinde tamamlamazsanız otomatik olarak iptal edilecektir. İşlemi iptal etmek için **iptal** yazabilirsin..`,
            ephemeral: true
        })

        const filter = (m) => m.author.id === button.user.id;
        const collector = button.channel.createMessageCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        collector.on('collect', async (msg) => {
            if (['iptal', 'i', 'cancel'].some((content) => msg.content.toLowerCase() === content)) {
                if (msg) msg.react(client.getEmoji('check'));
                return collector.stop()
            }

            const banner = msg.attachments.first() ? msg.attachments.first().url : null
            if (!banner) {
                load.edit({ content: `${client.getEmoji('mark')} Lütfen bir banner yükleyin.`, ephemeral: true })
                if (msg) msg.react(client.getEmoji('mark'));
                return collector.stop()
            }

            msg.react(client.getEmoji('check'));
            await client.updateClient(Client.token, banner, 'banner').then(async () => {
                load.edit({
                    content: `${client.getEmoji('check')} Botunuzun bannerı başarıyla güncellendi.`,
                    ephemeral: true
                })
            });
        });
    }

    if (ID == 'solver') {

        let ButtonCooldowns = solverCooldown.get(button.customId);
        if (!ButtonCooldowns) {
            solverCooldown.set(button.customId, new Collection());
            ButtonCooldowns = solverCooldown.get(button.customId);
        }

        const now = Date.now();
        const userCooldown = ButtonCooldowns.get(button.user.id);

        if (userCooldown) {
            const expirationTime = userCooldown + 1000 * 60 * 5;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return button.reply({ content: `Bu butonu tekrar kullanabilmek için **${timeLeft.toFixed(1)}** saniye beklemelisin.`, ephemeral: true });
            }
        } else {
            ButtonCooldowns.set(button.user.id, now);
            setTimeout(() => ButtonCooldowns.delete(button.user.id), 1000 * 60 * 5);
        }

        const solverChannel = button.guild.channels.cache.find((x) => x.name === "sorun-çözme-chat");
        if (!solverChannel) return button.reply({ content: `Sorun çözme kanalı bulunamadı.`, ephemeral: true });

        button.reply({ content: `Başarıyla sorun çözücü çağırdın.`, ephemeral: true });
        solverChannel.send({
            content: `${button.member} kullanıcısı bir sorun çözücü çağırıyor!\n||${button.guild.settings.solvingAuth.map(x => `<@&${x}>`).join(", ")}||`,
        })
    }

    if (ID == 'selectPublic') {

        const document = await Staff.findOne({ id: button.member.id });
        if (document?.tasks.length) return button.reply({ content: `Zaten bir göreviniz bulunmakta. Lütfen görevlerin sıfırlanmasını bekleyin.`, ephemeral: true });
        if (!button.guild.settings.maxStaffs.some(x => button.member.roles.cache.has(x))) return button.reply({ content: `Görev seçmek için üst yetkili olmanız gerekmektedir.`, ephemeral: true });

        const { currentRole } = await Staffs.getRank(button.member.roles.cache.map((r) => r.id))

        await Staff.updateOne(
            { id: button.member.id },
            {
                $set: {
                    tasks: currentRole?.REQUIRED_TASKS.map((t) => ({
                        type: t.TYPE,
                        name: t.NAME,
                        currentCount: 0,
                        requiredCount: t.COUNT_TYPE === 'TIME' ? ms(t.COUNT) : t.COUNT,
                        completed: false,
                    })),
                    task: 'Public',
                    roleStarted: Date.now()
                },

                $push: {
                    oldRoles: {
                        timestamp: Date.now(),
                        roles: [currentRole?.ROLE, currentRole?.EXTRA_ROLE]
                    }
                },
            },
            { new: true, upsert: true }
        );

        await Staff.findOneAndUpdate(
            { id: button.member.id, "tasks.type": "PUBLIC" },
            {
                $inc: { "tasks.$[elem].requiredCount": 36000000 },
            },
            { arrayFilters: [{ "elem.type": "PUBLIC" }], new: true, upsert: true }
        );

        button.reply({ content: `Başarıyla görevlerinizi aldınız.`, ephemeral: true });
    }

    if (ID == 'selectStreamer') {
        const document = await Staff.findOne({ id: button.member.id });
        if (document?.tasks.length) return button.reply({ content: `Zaten bir göreviniz bulunmakta. Lütfen görevlerin sıfırlanmasını bekleyin.`, ephemeral: true });
        if (!button.guild.settings.maxStaffs.some(x => button.member.roles.cache.has(x))) return button.reply({ content: `Görev seçmek için üst yetkili olmanız gerekmektedir.`, ephemeral: true });

        const { currentRole } = await Staffs.getRank(button.member.roles.cache.map((r) => r.id))

        await Staff.updateOne(
            { id: button.member.id },
            {
                $set: {
                    tasks: currentRole?.REQUIRED_TASKS.map((t) => ({
                        type: t.TYPE,
                        name: t.NAME,
                        currentCount: 0,
                        requiredCount: t.COUNT_TYPE === 'TIME' ? ms(t.COUNT) : t.COUNT,
                        completed: false,
                    })),
                    task: 'Streamer',
                    roleStarted: Date.now()
                },

                $push: {
                    oldRoles: {
                        timestamp: Date.now(),
                        roles: [currentRole?.ROLE, currentRole?.EXTRA_ROLE]
                    }
                },
            },
            { new: true, upsert: true }
        );

        await Staff.findOneAndUpdate(
            { id: button.member.id, "tasks.type": "STREAMER" },
            {
                $inc: { "tasks.$[elem].requiredCount": 36000000 },
            },
            { arrayFilters: [{ "elem.type": "STREAMER" }], new: true, upsert: true }
        );


        button.reply({ content: `Başarıyla görevlerinizi aldınız.`, ephemeral: true });
    }

    if (ID == 'selectStaff') {
        const document = await Staff.findOne({ id: button.member.id });
        if (document?.tasks.length) return button.reply({ content: `Zaten bir göreviniz bulunmakta. Lütfen görevlerin sıfırlanmasını bekleyin.`, ephemeral: true });
        if (!button.guild.settings.maxStaffs.some(x => button.member.roles.cache.has(x))) return button.reply({ content: `Görev seçmek için üst yetkili olmanız gerekmektedir.`, ephemeral: true });

        const { currentRole } = await Staffs.getRank(button.member.roles.cache.map((r) => r.id))

        await Staff.updateOne(
            { id: button.member.id },
            {
                $set: {
                    tasks: currentRole?.REQUIRED_TASKS.map((t) => ({
                        type: t.TYPE,
                        name: t.NAME,
                        currentCount: 0,
                        requiredCount: t.COUNT_TYPE === 'TIME' ? ms(t.COUNT) : t.COUNT,
                        completed: false,
                    })),
                    task: 'Yetkili Çekme',
                    roleStarted: Date.now()
                },

                $push: {
                    oldRoles: {
                        timestamp: Date.now(),
                        roles: [currentRole?.ROLE, currentRole?.EXTRA_ROLE]
                    }
                },
            },
            { new: true, upsert: true }
        );

        await Staff.findOneAndUpdate(
            { id: button.member.id },
            { $push: { tasks: { type: 'STAFF', name: 'Yetkili Üye Çekme', currentCount: 0, requiredCount: 10, completed: false } } },
            { new: true, upsert: true }
        );


        button.reply({ content: `Başarıyla görevlerinizi aldınız.`, ephemeral: true });
    }

    if (ID == 'selectMessage') {
        const document = await Staff.findOne({ id: button.member.id });
        if (document?.tasks.length) return button.reply({ content: `Zaten bir göreviniz bulunmakta. Lütfen görevlerin sıfırlanmasını bekleyin.`, ephemeral: true });
        if (!button.guild.settings.maxStaffs.some(x => button.member.roles.cache.has(x))) return button.reply({ content: `Görev seçmek için üst yetkili olmanız gerekmektedir.`, ephemeral: true });

        const { currentRole } = await Staffs.getRank(button.member.roles.cache.map((r) => r.id))

        await Staff.updateOne(
            { id: button.member.id },
            {
                $set: {
                    tasks: currentRole?.REQUIRED_TASKS.map((t) => ({
                        type: t?.TYPE,
                        name: t?.NAME,
                        currentCount: 0,
                        requiredCount: t?.COUNT_TYPE === 'TIME' ? ms(t.COUNT) : t.COUNT,
                        completed: false,
                    })),
                    task: 'Mesaj',
                    roleStarted: Date.now()
                },

                $push: {
                    oldRoles: {
                        timestamp: Date.now(),
                        roles: [currentRole?.ROLE, currentRole?.EXTRA_ROLE]
                    }
                },
            },
            { new: true, upsert: true }
        );

        await Staff.findOneAndUpdate(
            { id: button.member.id, "tasks.type": "MESSAGE" },
            {
                $inc: { "tasks.$[elem].requiredCount": 1000 },
            },
            { arrayFilters: [{ "elem.type": "MESSAGE" }], new: true, upsert: true }
        );


        button.reply({ content: `Başarıyla görevlerinizi aldınız.`, ephemeral: true });
    }

    if (ID == 'selectTag') {
        const document = await Staff.findOne({ id: button.member.id });
        if (document?.tasks.length) return button.reply({ content: `Zaten bir göreviniz bulunmakta. Lütfen görevlerin sıfırlanmasını bekleyin.`, ephemeral: true });
        if (!button.guild.settings.maxStaffs.some(x => button.member.roles.cache.has(x))) return button.reply({ content: `Görev seçmek için üst yetkili olmanız gerekmektedir.`, ephemeral: true });

        const { currentRole } = await Staffs.getRank(button.member.roles.cache.map((r) => r.id))

        await Staff.updateOne(
            { id: button.member.id },
            {
                $set: {
                    tasks: currentRole?.REQUIRED_TASKS.map((t) => ({
                        type: t?.TYPE,
                        name: t?.NAME,
                        currentCount: 0,
                        requiredCount: t?.COUNT_TYPE === 'TIME' ? ms(t.COUNT) : t.COUNT,
                        completed: false,
                    })),
                    task: 'Taglı Çekme',
                    roleStarted: Date.now()
                },

                $push: {
                    oldRoles: {
                        timestamp: Date.now(),
                        roles: [currentRole?.ROLE, currentRole?.EXTRA_ROLE]
                    }
                },
            },
            { new: true, upsert: true }
        );

        await Staff.findOneAndUpdate(
            { id: button.member.id },
            { $push: { tasks: { type: 'TAG', name: 'Taglı Üye Çekme', currentCount: 0, requiredCount: 10, completed: false } } },
            { new: true, upsert: true }
        );

        button.reply({ content: `Başarıyla görevlerinizi aldınız.`, ephemeral: true });
    }

    if (ID == 'public') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Public Sorumlusu"))) return button.reply({ content: `Zaten public sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Public Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla public sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }

    if (ID == 'chat') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Chat Sorumlusu"))) return button.reply({ content: `Zaten Chat sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

    
        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Chat Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Chat sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }

    if (ID == 'return') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Return Sorumlusu"))) return button.reply({ content: `Zaten Return sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Teyit Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Return sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }

    if (ID == 'oryantasyon') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Oryantasyon Sorumlusu"))) return button.reply({ content: `Zaten Oryantasyon sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Oryantasyon Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Oryantasyon sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }


    if (ID == 'soruncozme') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Sorun Çözücü"))) return button.reply({ content: `Zaten Sorun Çözücü rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Sorun Çözücü"))).catch(err => { });
        button.reply({ content: `Başarıyla Sorun Çözücü rolü üzerinize verildi.`, ephemeral: true });
    }

    if (ID == 'etkinlik') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Etkinlik Sorumlusu"))) return button.reply({ content: `Zaten Etkinlik sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Etkinlik Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Etkinlik sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }
    
    if (ID == 'yetkili') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Yetkili Alım Sorumlusu"))) return button.reply({ content: `Zaten Yetkili Alım sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Yetkili Alım Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Yetkili Alım sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }

      
    if (ID == 'ban') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Ban/Ceza Sorumlusu"))) return button.reply({ content: `Zaten Ban & Karantina sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Ban/Ceza Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Ban/Ceza Sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }

    if (ID == 'rol') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Rol Denetim Sorumlusu"))) return button.reply({ content: `Zaten Rol Denetim Sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Rol Denetim Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Rol Denetim Sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }

    if (ID == 'streamer') {
        const member = button.guild.members.cache.get(button.user.id);

        if (member.roles.cache.find((x) => x.name.includes("Streamer Sorumlusu"))) return button.reply({ content: `Zaten Streamer Sorumlusu rolünüz bulunmakta.`, ephemeral: true });
        let responsibleCount = 0;

        member.roles.cache.forEach(role => {
            if (responsibleRoles.some(x => role.name.includes(x))) {
                responsibleCount++;
            }
        });

        if (responsibleCount >= 3) return button.reply({ content: `En fazla 3 sorumluluk alabilirsiniz.`, ephemeral: true });
        button.member.roles.add(button.guild.roles.cache.find((x) => x.name.includes("Streamer Sorumlusu"))).catch(err => { });
        button.reply({ content: `Başarıyla Streamer Sorumlusu rolü üzerinize verildi.`, ephemeral: true });
    }
}

function formatDurations(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let timeString = "";

    if (hours > 0) {
        const minutes2 = minutes % 60;
        timeString += hours + "," + (minutes2 < 10 ? "0" : "") + minutes2 + " saat";
    } else if (minutes > 0) {
        const seconds2 = seconds % 60;
        timeString += minutes + "," + (seconds2 < 10 ? "0" : "") + seconds2 + " dakika";
    } else {
        timeString += seconds + " saniye";
    }

    return timeString.trim();
}