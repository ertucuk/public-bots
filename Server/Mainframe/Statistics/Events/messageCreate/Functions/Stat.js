const { User } = require('../../../../../Global/Settings/Schemas')
const OneDay = 1000 * 60 * 60 * 24;
const { ChannelType } = require("discord.js");

module.exports = async function statHandler(client, message) {
    if (message.author.bot || !message.guild || message.webhookID || message.channel.type === ChannelType.DM || message.content.includes('owo') || client.system.Main.Prefix.some(x => message.content.startsWith(x))) return;

    const now = new Date();
    const document = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
    const diff = now.valueOf() - document.LastDayTime;

    if (diff >= OneDay) {
        document.Days += Math.floor(diff / OneDay);
        document.LastDayTime = now.setHours(0, 0, 0, 0);
        document.markModified('Days LastDayTime');
    }

    if (!document.Messages) document.Messages = {};
    if (!document.Messages[document.Days]) document.Messages[document.Days] = { total: 0 };
    if (!message.content.startsWith('.') || !message.content.startsWith('!')) document.LastMessage = now;

    const dayData = document.Messages[document.Days];
    dayData.total += 1;
    dayData[message.channel.id] = (dayData[message.channel.id] || 0) + 1;
    document.markModified('Messages');
    
    const reference = message.reference ? (await message.fetchReference()).author : undefined;
    const friends = [...message.mentions.users.values(), reference].filter(
        (u) => u && !u.bot && u.id !== message.author.id,
    );
    if (friends.length) {
        if (!document.ChatFriends) document.ChatFriends = {};
        for (const friend of friends) {
            if (document.ChatFriends[friend.id]) document.ChatFriends[friend.id] += 1;
            else document.ChatFriends[friend.id] = 1;
        }
        document.markModified('ChatFriends');
    }
    await document.save();
}