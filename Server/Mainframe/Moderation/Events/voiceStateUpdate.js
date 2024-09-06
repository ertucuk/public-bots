const { Events, PermissionFlagsBits, bold } = require("discord.js");
const { SecretRoom } = require('../../../Global/Settings/Schemas');

module.exports = {
    Name: Events.VoiceStateUpdate,
    System: true,

    execute: async (client, oldState, newState) => {
        if (oldState.member && oldState.member.user.bot || newState.member && newState.member.user.bot) return;

        if (!oldState.channel && newState.channel) {
            const secretRoom = await SecretRoom.findOne({ id: newState.channel.id });
            if (!secretRoom) return;

            const channel = await client.channels.fetch(newState.channel.id);
            const member = channel.guild.members.cache.get(newState.id);

            const overwrite = channel.permissionOverwrites.cache.find(o => o.id === newState.member.id || o.id === newState.member.roles.highest.id);
            const isAllow = overwrite ? overwrite.allow.has(PermissionFlagsBits.Connect) : false;
            const isLock = channel.permissionOverwrites.cache.some(o => o.id === channel.guild.roles.everyone.id && o.deny.has(PermissionFlagsBits.Connect));
            const isAdmin = newState.member.permissions.has(PermissionFlagsBits.Administrator);

            if (isAdmin && !isAllow && isLock) {
                if (member?.voice.channel) {
                    member.send({ content: `${bold(channel.name)} adlı özel oda için yetkiniz bulunmamaktadır.` }).catch();
                    channel.send({ content: `${member} kullanıcısı kanala katıldı fakat kanalda izni olmadığı için bağlantısı kesildi...` }).then((e) => setTimeout(() => { e.delete(); }, 20000));
                    member.voice.disconnect();
                }
                return;
            }
        }

        if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            console.log('ertu baska bir kanala giris yapti')
            const secretRoom = await SecretRoom.findOne({ id: newState.channel.id });
            if (!secretRoom) return;

            const channel = await client.channels.fetch(newState.channel.id);
            const member = channel.guild.members.cache.get(newState.member.id);

            const overwrite = channel.permissionOverwrites.cache.find(o => o.id === newState.member.id || o.id === newState.member.roles.highest.id);
            const isAllow = overwrite ? overwrite.allow.has(PermissionFlagsBits.Connect) : false;
            const isLock = channel.permissionOverwrites.cache.some(o => o.id === channel.guild.roles.everyone.id && o.deny.has(PermissionFlagsBits.Connect));
            const isAdmin = newState.member.permissions.has(PermissionFlagsBits.Administrator);

            if (isAdmin && !isAllow && isLock) {
                if (member?.voice.channel) {
                    member.send({ content: `${bold(channel.name)} adlı özel oda için yetkiniz bulunmamaktadır.` }).catch();
                    channel.send({ content: `${member} kullanıcısı kanala katıldı fakat kanalda izni olmadığı için bağlantısı kesildi...` }).then((e) => setTimeout(() => { e.delete(); }, 20000));
                    member.voice.disconnect();
                }
                return;
            }
        }


        if (oldState.channel && !newState.channel) {
            const channel = await client.channels.fetch(secretRoom.id);
            if (channel.members.size === 0) {
                await channel.delete();
                await SecretRoom.deleteMany({ id: secretRoom.id });
            }
        }
    }
};