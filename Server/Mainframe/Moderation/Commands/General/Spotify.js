const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ActivityType } = require('discord.js');
const { ClassicPro, Classic, Mini, Dynamic } = require("musicard");
const moment = require('moment');
moment.locale('tr');

module.exports = {
    Name: 'spotify',
    Aliases: ['spo'],
    Description: 'Belirttiğiniz kullanıcının dinlediği şarkıyı gösterir.',
    Usage: 'spotify',
    Category: 'Global',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000)); 
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (member.presence && member.presence.activities && member.presence.activities.some((activity) => activity.name == 'Spotify' && activity.type == ActivityType.Listening)) {
            let status = await member.presence.activities.find((activity) => activity.type == ActivityType.Listening)
            const sex = new Date(status.timestamps.end).getTime() - new Date(status.timestamps.start).getTime();
            const gecensüre = new Date(Date.now()).getTime() - new Date(status.timestamps.start).getTime();
            const progress = (gecensüre / sex) * 100;
            let spotifyCard = await Classic({
                thumbnailImage: `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`,
                backgroundColor: "#070707",
                progress: progress,
                progressColor: "#ffffff",
                progressBarColor: "#201d1d",
                name: status.details,
                nameColor: "#ffffff",
                author: status.state,
                authorColor: "#696969",
                startTime: sureCevir(new Date(Date.now()).getTime() - new Date(status.timestamps.start).getTime()),
                endTime: sureCevir(new Date(status.timestamps.end).getTime() - new Date(status.timestamps.start).getTime(), true),
                timeColor: "#ffffff"
            });

            return message.reply({ files: [{ name: 'spotify.png', attachment: spotifyCard }] }).then((msg) => setTimeout(() => msg.delete(), 15000));
        } else {
            return message.reply({ content: `${client.getEmoji('mark')} Kullanıcı şu anda Spotify'da şarkı dinlemiyor.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
        }
    }
}

function sureCevir(veri, isEndTime = false) {
    if (isEndTime) {
        return moment.utc(veri).format("m:ss");
    } else {
        return moment.utc(veri).format("mm:ss");
    }
}