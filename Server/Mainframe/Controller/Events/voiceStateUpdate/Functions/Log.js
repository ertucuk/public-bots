const { EmbedBuilder, bold, inlineCode } = require("discord.js");
const { User, Join } = require("../../../../../Global/Settings/Schemas/");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = async function logHanlder(client, oldState, newState) {

    if (!oldState.guild || !oldState.member || !newState.member || !newState.guild) return;
    if (oldState?.member.user.bot || newState?.member.user.bot) return;

    const voiceChannel = await client.getChannel('voice-log', oldState);
    const streamerChannel = await client.getChannel('streamer-log', oldState);
    if (!voiceChannel || !streamerChannel) return;

    if (!oldState.channel && newState.channel) {
        await User.updateOne({ userID: newState.id }, { $push: { VoiceLogs: { type: "Katılma", time: Date.now(), channelId: newState.channelId } } });
        voiceChannel.send({
            embeds: [
                new EmbedBuilder({
                    author: { name: newState.member.user.username, icon_url: newState.member.user.displayAvatarURL({ dynamic: true }) },
                    description: [
                        `${newState.member} adlı üye ${newState.channel} ses kanalına giriş yaptı.\n`,
                        `${bold('Kanala Girdiği Anda:')}`,
                        `${client.getEmoji('point')} Mikrofonu: ${newState.mute ? '**Kapalı**' : '**Açık**'}`,
                        `${client.getEmoji('point')} Kulaklığı: ${newState.seldDeaf ? '**Açık**' : '**Kapalı**'}\n`,
                        `${client.getEmoji('point')} Girdiği Kanal: ${inlineCode(newState.channel.name + ` (${newState.channel.id})`)}`,
                        `${client.getEmoji('point')} Kullanıcı: ${inlineCode(newState.member.user.username)}`,
                        `${client.getEmoji('point')} Eylem Gerçekleşme: ${client.timestamp(Date.now())}\n`,
                        `${bold('Girdiği Kanalda Bulunanlar:')}`,
                        `${newState.channel.members.size <= 10 ? newState.channel.members.map(m => m).join('\n') : `${newState.channel.members.map(m => m).slice(0, 10).map(m => m).join('\n')}\nve ${newState.channel.members.size - 10} kişi daha...`}`
                    ].join('\n'),
                })
            ]
        });
    }

    if (oldState.channel && !newState.channel) {
        await User.updateOne({ userID: newState.id }, { $push: { VoiceLogs: { type: "Ayrılma", time: Date.now(), channelId: oldState.channelId } } });
        voiceChannel.send({
            embeds: [
                new EmbedBuilder({
                    author: { name: newState.member.user.username, icon_url: newState.member.user.displayAvatarURL({ dynamic: true }) },
                    description: [
                        `${newState.member} adlı üye ${oldState.channel} ses kanalından ayrıldı.\n`,
                        `${bold('Kanaldan Çıktığı Anda:')}`,
                        `${client.getEmoji('point')} Mikrofonu: ${oldState.mute ? '**Kapalı**' : '**Açık**'}`,
                        `${client.getEmoji('point')} Kulaklığı: ${oldState.seldDeaf ? '**Açık**' : '**Kapalı**'}\n`,
                        `${client.getEmoji('point')} Çıktığı Kanal: ${inlineCode(oldState.channel.name + ` (${oldState.channel.id})`)}`,
                        `${client.getEmoji('point')} Kullanıcı: ${inlineCode(newState.member.user.username)}`,
                        `${client.getEmoji('point')} Eylem Gerçekleşme: ${client.timestamp(Date.now())}\n`,
                        `${bold('Çıktığı Kanalda Bulunanlar:')}`,
                        `${oldState.channel.members.size <= 10 ? oldState.channel.members.map(m => m).join('\n') : `${oldState.channel.members.map(m => m).slice(0, 10).map(m => m).join('\n')}\nve ${oldState.channel.members.size - 10} kişi daha...`}`
                    ].join('\n'),
                })
            ]
        });
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        await User.updateOne({ userID: newState.id }, { $push: { VoiceLogs: { type: "Taşıma", time: Date.now(), channelId: oldState.channelId } } });
        voiceChannel.send({
            embeds: [
                new EmbedBuilder({
                    author: { name: newState.member.user.username, icon_url: newState.member.user.displayAvatarURL({ dynamic: true }) },
                    description: [
                        `${newState.member} adlı üye ${oldState.channel} adlı ses kanalından ${newState.channel} ses kanalına geçiş yaptı.\n`,
                        `${bold('Kanal Değiştirdiği Anda:')}`,
                        `${client.getEmoji('point')} Mikrofonu: ${newState.mute ? '**Kapalı**' : '**Açık**'}`,
                        `${client.getEmoji('point')} Kulaklığı: ${newState.seldDeaf ? '**Açık**' : '**Kapalı**'}\n`,
                        `${client.getEmoji('point')} Eski Kanal: ${inlineCode(oldState.channel.name + ` (${oldState.channel.id})`)}`,
                        `${client.getEmoji('point')} Yeni Kanal: ${inlineCode(newState.channel.name + ` (${newState.channel.id})`)}`,
                        `${client.getEmoji('point')} Kullanıcı: ${inlineCode(newState.member.user.username)}`,
                        `${client.getEmoji('point')} Eylem Gerçekleşme: ${client.timestamp(Date.now())}\n`,
                        `${bold('Eski Kanalda Bulunanlar:')}`,
                        `${oldState.channel.members.size <= 10 ? oldState.channel.members.map(m => m).join('\n') : `${oldState.channel.members.map(m => m).slice(0, 10).map(m => m).join('\n')}\nve ${oldState.channel.members.size - 10} kişi daha...`}`,
                        `${bold('Yeni Kanalda Bulunanlar:')}`,
                        `${newState.channel.members.size <= 10 ? newState.channel.members.map(m => m).join('\n') : `${newState.channel.members.map(m => m).slice(0, 10).map(m => m).join('\n')}\nve ${newState.channel.members.size - 10} kişi daha...`}`,
                    ].join('\n'),
                })
            ]
        });
    }

    if (!oldState.streaming && newState.streaming) {
        streamerChannel.send({
            embeds: [
                new EmbedBuilder({
                    author: { name: newState.member.user.username, icon_url: newState.member.user.displayAvatarURL({ dynamic: true }) },
                    description: [
                        `${newState.member} adlı üye **${moment(Date.now()).format("LLL")}** tarihinde ${newState.channel} ses kanalında yayın açtı.\n`,
                        `${bold('Yayın Açtığı Anda:')}`,
                        `${client.getEmoji('point')} Mikrofonu: ${newState.mute ? '**Kapalı**' : '**Açık**'}`,
                        `${client.getEmoji('point')} Kulaklığı: ${newState.seldDeaf ? '**Açık**' : '**Kapalı**'}\n`,
                        `${client.getEmoji('point')} Yayın Açtığı Kanal: ${inlineCode(newState.channel.name + ` (${newState.channel.id})`)}`,
                        `${client.getEmoji('point')} Kullanıcı: ${inlineCode(newState.member.user.username)}`,
                        `${client.getEmoji('point')} Eylem Gerçekleşme: ${client.timestamp(Date.now())}\n`,
                        `${bold('Yayın Açanlar:')}`,
                        `${newState.channel.members.size <= 10 ? newState.channel.members.map(m => m).join('\n') : `${newState.channel.members.map(m => m).slice(0, 10).map(m => m).join('\n')}\nve ${newState.channel.members.size - 10} kişi daha...`}`
                    ].join('\n'),
                })
            ]
        });
    }

    if (oldState.streaming && !newState.streaming) {
        const cache = await Join.findOne({ userID: oldState.id });
        if (!cache) return;

        const joinTime = cache.Stream;
        const diff = Date.now() - joinTime;
        if (diff === 0) return;

        streamerChannel.send({
            embeds: [
                new EmbedBuilder({
                    author: { name: newState.member.user.username, icon_url: newState.member.user.displayAvatarURL({ dynamic: true }) },
                    description: [
                        `${newState.member} adlı üye **${moment.duration(diff).format("H [saat,] m [dakika,] s [saniye]")}** ${newState.channel} ses kanalında yayını yaptı.\n`,
                        `${bold('Yayını Kapattığı Anda:')}`,
                        `${client.getEmoji('point')} Mikrofonu: ${oldState.mute ? '**Kapalı**' : '**Açık**'}`,
                        `${client.getEmoji('point')} Kulaklığı: ${oldState.seldDeaf ? '**Açık**' : '**Kapalı**'}\n`,
                        `${client.getEmoji('point')} Yayını Kapattığı Kanal: ${inlineCode(oldState.channel.name + ` (${oldState.channel.id})`)}`,
                        `${client.getEmoji('point')} Kullanıcı: ${inlineCode(newState.member.user.username)}`,
                        `${client.getEmoji('point')} Eylem Gerçekleşme: ${client.timestamp(Date.now())}\n`,
                        `${bold('Yayını Kapatanlar:')}`,
                        `${oldState.channel.members.size <= 10 ? oldState.channel.members.map(m => m).join('\n') : `${oldState.channel.members.map(m => m).slice(0, 10).map(m => m).join('\n')}\nve ${oldState.channel.members.size - 10} kişi daha...`}`
                    ].join('\n'),
                })
            ]
        });
    }
}