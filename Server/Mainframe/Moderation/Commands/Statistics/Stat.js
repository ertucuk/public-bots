const { PermissionsBitField: { Flags }, EmbedBuilder, bold, italic, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { User, Staff } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'stat',
    Aliases: ['detaylı', 'detailed', 'detayli', 'detay', 'verilerim'],
    Description: 'Kullanıcıların detaylı istatistiklerini gösterir.',
    Usage: 'stat <@User/ID> <gün sayısı>',
    Category: 'Stat',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.channel.send({ content: `Kullanıcı bulunamadı.` });
            return;
        }

        if (member.user.bot) {
            message.channel.send({ content: `Botlar için bu komut kullanılamaz.` });
            return;
        }

        const document = await User.findOne({ userID: member.id });
        if (!document) {
            message.channel.send({ content: `Kullanıcının verisi bulunmamaktadır.` });
            return;
        }

        const argIndex = member.id !== message.author.id ? 1 : 0;
        const wantedDay = args[argIndex] ? Number(args[argIndex]) : document.Days;

        if (!wantedDay || wantedDay <= 0) {
            message.channel.send({ content: `Lütfen geçerli bir gün sayısı girin.` });
            return;
        }

        const now = Date.now();
        const timeLimit = now - wantedDay * 24 * 60 * 60 * 1000;
        const invitingUsers = await User.find({ UserInviter: member.id });

        const filteredRecords = document?.Records?.filter(record => record.Date >= timeLimit).length || 0;
        const filteredStaffs = document?.Auths?.filter(staff => staff.timestamp >= timeLimit).length || 0;
        const filteredTaggeds = document?.Taggeds?.filter(tagged => tagged.timestamp >= timeLimit).length || 0;
        const filteredInvites = invitingUsers?.filter(inv => message.guild.members.cache.get(inv.userID) && message.guild.members.cache.get(inv.userID).joinedTimestamp >= timeLimit).length || 0;
        const filteredSolvers = document?.Solvers?.filter(solver => solver.timestamp >= timeLimit).length || 0;
        const filteredReturns = document?.Returns?.filter(returned => returned.timestamp >= timeLimit).length || 0;
        
        const totalVoiceCategories = getTopCategory(message, document, document.Voices || {}, wantedDay > document.Days ? document.Days : wantedDay);
        const totalVoiceChannels = getTopChannels(message, document, document.Voices || {}, wantedDay > document.Days ? document.Days : wantedDay);
        const totalMessageChannels = getTopChannels(message, document, document.Messages || {}, wantedDay > document.Days ? document.Days : wantedDay);
        const totalStreamChannels = getTopChannels(message, document, document.Streams || {}, wantedDay > document.Days ? document.Days : wantedDay);
        const totalCameraChannels = getTopChannels(message, document, document.Cameras || {}, wantedDay > document.Days ? document.Days : wantedDay);

        const isStaff = message.guild.settings.staffs.some((r) => member.roles.cache.has(r));
        const fields = [
            {
                name: `Toplam Kategori Sıralaması **(\`${formatDurations(totalVoiceCategories.total) || '0 Saniye'}\`)**`,
                value: totalVoiceCategories.categories.length === 0 ?
                    'Veri Bulunamadı' :
                    totalVoiceCategories.categories.map((c) =>
                        `${client.getEmoji('point')} ${message.guild.channels.cache.get(c.id)}: \`${formatDurations(c.value)}\``
                    ).join('\n'),
                inline: false,
            },
            {
                name: `Toplam Kanal Sıralaması **(\`${formatDurations(totalVoiceChannels.total) || '0 Saniye'}\`)**`,
                value: totalVoiceChannels.channels.length === 0 ?
                    'Veri Bulunamadı' :
                    totalVoiceChannels.channels.map((c) =>
                        `${client.getEmoji('point')} ${message.guild.channels.cache.get(c.id) ? message.guild.channels.cache.get(c.id) : '#silinen-kanal'}: ${italic(formatDurations(c.value))}`
                    ).join('\n'),
                inline: false,
            },
            {
                name: `Toplam Yayın Sıralaması **(\`${formatDurations(totalStreamChannels.total) || '0 Saniye'}\`)**`,
                value: totalStreamChannels.channels.length === 0 ?
                    'Veri Bulunamadı' :
                    totalStreamChannels.channels.map((c) =>
                        `${client.getEmoji('point')} ${message.guild.channels.cache.get(c.id) ? message.guild.channels.cache.get(c.id) : '#silinen-kanal'}: ${italic(formatDurations(c.value))}`
                    ).join('\n'),
                inline: false,
            },
            {
                name: `Toplam Kamera Sıralaması **(\`${formatDurations(totalCameraChannels.total) || '0 Saniye'}\`)**`,
                value: totalCameraChannels.channels.length === 0 ?
                    'Veri Bulunamadı' :
                    totalCameraChannels.channels.map((c) =>
                        `${client.getEmoji('point')} ${message.guild.channels.cache.get(c.id) ? message.guild.channels.cache.get(c.id) : '#silinen-kanal'}: ${italic(formatDurations(c.value))}`
                    ).join('\n'),
                inline: false,
            },
            {
                name: `Toplam Mesaj Kanal Sıralaması **(\`${totalMessageChannels.total} Mesaj\`)**`,
                value: totalMessageChannels.channels.length === 0 ?
                    'Veri Bulunamadı' :
                    totalMessageChannels.channels.map((c) =>
                        `${client.getEmoji('point')} ${message.guild.channels.cache.get(c.id) ? message.guild.channels.cache.get(c.id) : '#silinen-kanal'}: ${italic(c.value)} mesaj`
                    ).join('\n'),
                inline: false,
            },
        ];

        if (isStaff) {
            fields.push({
                name: 'Diğer Bilgiler',
                value: [
                    `${client.getEmoji('point')} \` Taglı Çekme       : \` ${filteredTaggeds} adet`,
                    `${client.getEmoji('point')} \` Yetkili Çekme     : \` ${filteredStaffs} adet`,
                    `${client.getEmoji('point')} \` Kayıt Yapma       : \` ${filteredRecords} adet`,
                    `${client.getEmoji('point')} \` Davet Yapma       : \` ${filteredInvites} adet`,
                    `${client.getEmoji('point')} \` Return            : \` ${filteredReturns} adet`,
                    `${client.getEmoji('point')} \` Oryantasyon       : \` 0 adet`,
                    `${client.getEmoji('point')} \` Sorun Çözme       : \` ${filteredSolvers} adet`,        
                ].join('\n'),
                inline: false,
            });
        }


        const embed = new EmbedBuilder({
            color: 0x2F3136,
            description: `${member} adlı kullanıcının ${bold(`${wantedDay} günlük`)} veri bilgileri;`,
            thumbnail: { url: member.user.displayAvatarURL({ dynamic: true, size: 2048 }) },
            footer: { text: `${wantedDay > document.Days ? `Kullanıcının ${document.Days.toString()} günlük verisi bulundu.` : 'ertu was here ❤️'}` },
            fields: fields,
        })

        message.channel.send({
            embeds: [embed],
        });
    },
};

function getTopChannels(message, document, days, day) {
    const channelStats = {};
    let total = 0;
    Object.keys(days)
        .filter((d) => day > document.Days - Number(d))
        .forEach((d) =>
            Object.keys(days[d]).forEach((channelId) => {
                if (channelId == 'total') return;

                if (!channelStats[channelId]) channelStats[channelId] = 0;
                channelStats[channelId] += days[d][channelId];
                total += days[d][channelId];
            }),
        );
    return {
        channels: Object.keys(channelStats)
            .sort((a, b) => channelStats[b] - channelStats[a])
            .map((c) => ({ id: c, value: channelStats[c] }))
            .slice(0, 5),
        total,
    };
}

function getTopCategory(message, document, days, day) {
    const channelStats = {};
    let total = 0;
    Object.keys(days)
        .filter((d) => day > document.Days - Number(d))
        .forEach((d) =>
            Object.keys(days[d]).forEach((channelId) => {
                const channel = message.guild.channels.cache.get(channelId);
                if (!channel || !channel.parentId) return;

                if (!channelStats[channel.parentId]) channelStats[channel.parentId] = 0;
                channelStats[channel.parentId] += days[d][channel.id];
                total += days[d][channel.id];
            }),
        );

    return {
        categories: Object.keys(channelStats)
            .sort((a, b) => channelStats[b] - channelStats[a])
            .map((c) => ({ id: c, value: channelStats[c] }))
            .slice(0, 5),
        total,
    };
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