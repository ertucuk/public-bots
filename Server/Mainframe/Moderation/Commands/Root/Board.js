const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, bold } = require('discord.js');
const { User, Servers } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'leaderboard',
    Aliases: ['leader-board'],
    Description: 'Liderlik tablosunu gösterir.',
    Usage: 'leaderboard',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const Message = await User.aggregate([
            { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Messages` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
            { $match: { total: { $gt: 0 } } },
            { $sort: { total: -1 } },
            { $skip: 0 },
            { $limit: 3 },
            { $project: { userID: 1, total: 1 } },
        ]);

        const Voice = await User.aggregate([
            { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Voices` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
            { $match: { total: { $gt: 0 } } },
            { $sort: { total: -1 } },
            { $skip: 0 },
            { $limit: 3 },
            { $project: { userID: 1, total: 1 } },
        ]);

        const Stream = await User.aggregate([
            { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Streams` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
            { $match: { total: { $gt: 0 } } },
            { $sort: { total: -1 } },
            { $skip: 0 },
            { $limit: 3 },
            { $project: { userID: 1, total: 1 } },
        ]);

        const Camera = await User.aggregate([
            { $project: { userID: '$userID', total: { $reduce: { input: { $objectToArray: `$Cameras` }, initialValue: 0, in: { $add: ["$$value", "$$this.v.total"] } } } } },
            { $match: { total: { $gt: 0 } } },
            { $sort: { total: -1 } },
            { $skip: 0 },
            { $limit: 3 },
            { $project: { userID: 1, total: 1 } },
        ]);

        const MessageArray = [];
        const VoiceArray = [];
        const StreamArray = [];
        const CameraArray = [];

        Message.forEach((data, index) => {
            MessageArray.push({ id: data.userID, total: data.total, i: index + 1 });
        });

        Voice.forEach((data, index) => {
            VoiceArray.push({ id: data.userID, total: data.total, i: index + 1 });
        });

        Stream.forEach((data, index) => {
            StreamArray.push({ id: data.userID, total: data.total, i: index + 1 });
        });

        Camera.forEach((data, index) => {
            CameraArray.push({ id: data.userID, total: data.total, i: index + 1 });
        });

        const embed = new EmbedBuilder({
            color: client.random(),
            description: [
                `${client.getEmoji('point')} ${bold(`Aşağıda ${message.guild.name} sunucusunun sıralama tablosu listelenmektedir.`)}\n`,
                `${client.getEmoji('point')} **Ses Sıralaması:**\n${VoiceArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${formatDurations(data.total)}`).join('\n')}\n`,
                `${client.getEmoji('point')} **Mesaj Sıralaması:**\n${MessageArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${data.total} mesaj`).join('\n')}\n`,
                `${client.getEmoji('point')} **Yayın Sıralaması:**\n${StreamArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${formatDurations(data.total)}`).join('\n')}\n`,
                `${client.getEmoji('point')} **Kamera Sıralaması:**\n${CameraArray.map((data) => `${data.i === 1 ? '🥇' : data.i === 2 ? '🥈' : data.i === 3 ? '🥉' : ''} <@${data.id}>: ${formatDurations(data.total)}`).join('\n')}\n`,
                `${client.getEmoji('point')} **Sıralama Tablosu Saatlik Güncellenmektedir.**`,
            ].join('\n'),
        })

        let msg = await message.channel.send({ embeds: [embed] });
        await Servers.findOneAndUpdate(
            { serverID: message.guild.id },
            { $set: { 'leaderboard': { channel: message.channel.id, msg: msg.id } } },
            { upsert: true }
        );
    },
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