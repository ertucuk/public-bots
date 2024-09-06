const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, italic, bold, inlineCode } = require('discord.js');
const { User, Staff } = require('../../../../Global/Settings/Schemas')

module.exports = {
    Name: 'detaydenetim',
    Aliases: ['rolstat', 'rolkontrol'],
    Description: 'Belirttiğiniz roldeki üyelerin istatistiklerini gösterir.',
    Usage: 'detaydenetim <@Rol/ID>',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.leaderRoles.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) {
            message.reply({ content: `${client.getEmoji('mark')} Bir rol belirtmelisin.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 

        const members = message.guild.members.cache.filter(member => member.roles.cache.has(role.id));
        if (members.size === 0) {
            message.reply({ content: `${client.getEmoji('mark')} Bu rolde hiç üye bulunmuyor.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        let verisizler = [];
        let memberDetails = [];

        await Promise.all(members.map(async member => {
            const userStats = await User.findOne({ userID: member.id });
            const userVoice = userStats?.Voices || {};
            const userMessage = userStats?.Messages || {};
            const Days = userStats?.Days || 0;

            const totalVoiceChannels = getTopChannels(message, userStats, userVoice, Days);
            const totalMessageChannels = getTopChannels(message, userStats, userMessage, Days);
            const totalVoiceCategories = getTopCategory(message, userStats, userVoice, Days);
            const weeklyVoiceChannels = getTopChannels(message, userStats, userVoice, 7);
            const weeklyMessageChannels = getTopChannels(message, userStats, userMessage, 7);

            if (totalVoiceChannels.total === 0 && totalMessageChannels.total === 0) {
                verisizler.push(member.toString());
                return;
            }

            let memberData = {
                memberString: member.toString(),
                voiceTotal: totalVoiceChannels.total,
                weeklyVoiceTotal: weeklyVoiceChannels.total,
                messageData: totalMessageChannels.total,
                weeklyMessageData: weeklyMessageChannels.total,
                categoryData: totalVoiceCategories.categories,
            };

            memberDetails.push(memberData);
        }));

        memberDetails.sort((a, b) => b.voiceTotal - a.voiceTotal);

        let allMemberData = memberDetails.map((detail, index) => {
            return `${index == 0 ? `👑` : `**${index + 1}.**`} ${detail.memberString} Üyesinin ses ve genel chat istatistik bilgileri:
Tüm zaman boyunca \`${formatDurations(detail.voiceTotal)}\` seste kalmış.
Tüm zaman boyunca toplam da \`${detail.messageData}\` mesaj atmış.
Bu hafta boyunca \`${formatDurations(detail.weeklyVoiceTotal)}\` seste kalmış.
Bu hafta boyunca toplam da \`${detail.weeklyMessageData}\` mesaj atmış.
${detail.categoryData.length > 0 ? `Bu hafta vakit geçirdiği kanal(lar) şunlardır:
${detail.categoryData.map(c => `\` • \` ${message.guild.channels.cache.get(c.id)}: ${italic(formatDurations(c.value))}`).join("\n")}` : `Bu hafta kategorilendirilmiş ses kanallarında bulunamamış.`}\n`;
        });

        let finalMessage = allMemberData.join("\n");
        if (verisizler.length > 0) {
            finalMessage += `\n──────────────────────
**${role.name}** rolünde bulunan **${verisizler.length}** üyenin verisi bulunamadı veya gereğinden çok yetersiz. Bu üyeler şunlardır:
${verisizler.join(", ")}
──────────────────────`;
        }

        const splitMessages = splitMessage(finalMessage, { maxLength: 1950, char: "\n" });
        splitMessages.forEach(element => {
            message.channel.send({ content: `${element}` });
        });
    }
};

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
            .slice(0, 10),
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
            .slice(0, 10),
        total,
    };
}

function splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
    if (text.length <= maxLength) return [append + text + prepend];
    const splitText = text.split(char);
    const messages = [];
    let msg = '';
    for (const chunk of splitText) {
        if (msg && (msg + char + chunk + append).length > maxLength) {
            messages.push(msg + append);
            msg = prepend;
        }
        msg += (msg && msg !== prepend ? char : '') + chunk;
    }
    return messages.concat(msg).filter((m) => m);
};