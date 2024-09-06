const { Events } = require("discord.js");
const { User, Join } = require('../../../Global/Settings/Schemas');
const ONE_DAY = 1000 * 60 * 60 * 24;
const Staffs = require("../../../Global/Base/Staff")
module.exports = {
    Name: Events.VoiceStateUpdate,
    System: true,

    execute: async (client, oldState, newState) => {
        if (oldState.member && oldState.member.user.bot || newState.member && newState.member.user.bot) return;

        if (!oldState.channel && newState.channel) {
            await Join.updateOne({ userID: newState.id }, { $set: { Voice: Date.now() } }, { upsert: true });
            return;
        }

        if (oldState.channel && !newState.channel) {
            const cache = await Join.findOne({ userID: oldState.id });
            if (!cache) return;

            const joinTime = cache.Voice;
            const diff = Date.now() - joinTime;

            if (diff > 0) {
                await VoiceStat(oldState.member, oldState.channel, diff, 'Voice');
                await Join.deleteOne({ userID: oldState.id });
                return;
            }
        }

        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const cache = await Join.findOne({ userID: oldState.id });
            if (!cache) return;

            const joinTime = cache.Voice;
            const diff = Date.now() - joinTime;

            if (diff > 0) await VoiceStat(oldState.member, oldState.channel, diff, 'Voice');

            await Join.updateOne({ userID: oldState.id }, { $set: { Voice: Date.now() } });
        }

        if (!oldState.streaming && newState.streaming) {
            await Join.updateOne({ userID: newState.id }, { $set: { Stream: Date.now() } }, { upsert: true });
            await User.updateOne({ userID: newState.id }, { $inc: { StreamsCount: 1 } })
            return;
        }

        if (oldState.streaming && !newState.streaming) {
            const cache = await Join.findOne({ userID: oldState.id });
            if (!cache) return;

            const joinTime = cache.Stream;
            const diff = Date.now() - joinTime;

            if (diff > 0) await VoiceStat(oldState.member, oldState.channel, diff, 'Stream');

            await Join.updateOne({ userID: oldState.id }, { $unset: { Stream: 0 } });
            return;
        }

        if (!oldState.selfVideo && newState.selfVideo) {
            await Join.updateOne({ userID: newState.id }, { $set: { Camera: Date.now() } }, { upsert: true });
            await User.updateOne({ userID: newState.member.id }, { $inc: { CamerasCount: 1 } })
            return;
        }

        if (oldState.selfVideo && !newState.selfVideo) {
            const cache = await Join.findOne({ userID: oldState.id });
            if (!cache) return;

            const joinTime = cache.Camera;
            const diff = Date.now() - joinTime;

            if (diff > 0) await VoiceStat(oldState.member, oldState.channel, diff, 'Camera');

            await Join.updateOne({ userID: oldState.id }, { $unset: { Camera: 0 } });
            return;
        }
    }
};

async function VoiceStat(Member, Channel, Data, Type = 'Voice' | 'Stream' | 'Camera') {
    const Now = new Date()
    const document = (await User.findOne({ userID: Member.id })) || new User({ userID: Member.id }).save();
    const Diff = Now.valueOf() - document.LastDayTime;

    if (Type === 'Voice') {
        if (Diff >= ONE_DAY) {
            document.Days += Math.floor(Diff / ONE_DAY);
            document.LastDayTime = Now.setHours(0, 0, 0, 0);
            document.markModified('Days LastDayTime');
        }

        const friends = Channel.members.filter((m) => !m.user.bot && m.id !== Member.id);
        if (friends.size) {
            if (!document.VoiceFriends) document.VoiceFriends = {};
            for (const [id] of friends) {
                if (document.VoiceFriends[id]) document.VoiceFriends[id] += Data;
                else document.VoiceFriends[id] = Data;
            }
            document.markModified('VoiceFriends');
        }

        if (!document.Voices) document.Voices = {};
        if (!document.Voices[document.Days]) document.Voices[document.Days] = { total: 0 };

        const dayData = document.Voices[document.Days];
        dayData.total += Data;
        dayData[Channel.id] = (dayData[Channel.id] || 0) + Data;
        document.LastVoice = Now;
        document.markModified('Voices');
        await document.save();

        if (!Staffs.checkStaff(Member) && !Staffs.checkPointStaff(Member)) return;

        if (Member.guild.settings.maxStaffs.some(r => Member.roles.cache.has(r))) {
            if (Data > 0) Staffs.addVoiceStat(Member, Channel, Data)
        } else {
            if (Data > 0) Staffs.addPoint(Member, 'voice', Data, Channel)
        }
    }

    if (Type === 'Stream') {
        if (Diff >= ONE_DAY) {
            document.Days += Math.floor(Diff / ONE_DAY);
            document.LastDayTime = Now.setHours(0, 0, 0, 0);
            document.markModified('Days LastDayTime');
        }

        if (!document.Streams) document.Streams = {};
        if (!document.Streams[document.Days]) document.Streams[document.Days] = { total: 0 };

        const dayData = document.Streams[document.Days];
        dayData.total += Data;
        dayData[Channel.id] = (dayData[Channel.id] || 0) + Data;
        document.markModified('Streams');
    }

    if (Type === 'Camera') {
        if (Diff >= ONE_DAY) {
            document.Days += Math.floor(Diff / ONE_DAY);
            document.LastDayTime = Now.setHours(0, 0, 0, 0);
            document.markModified('Days LastDayTime');
        }

        if (!document.Cameras) document.Cameras = {};
        if (!document.Cameras[document.Days]) document.Cameras[document.Days] = { total: 0 };

        const dayData = document.Cameras[document.Days];
        dayData.total += Data;
        dayData[Channel.id] = (dayData[Channel.id] || 0) + Data;
        document.markModified('Cameras');
    }

    await document.save();
}