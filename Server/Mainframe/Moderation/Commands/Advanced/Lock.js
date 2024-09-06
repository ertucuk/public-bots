const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    Name: 'kilit',
    Aliases: ['lock'],
    Description: 'Belirttiğin kanalı kitler.',
    Usage: 'kilit',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 

        const role = message.guild.roles.everyone;
        const channelPermissions = message.channel.permissionOverwrites.cache.get(role.id) || { allow: new Set(), deny: new Set() };
        const hasSendMessagesPermission = !channelPermissions.allow.has(Flags.SendMessages) || channelPermissions.deny.has(Flags.SendMessages);
        message.channel.permissionOverwrites.edit(role.id, { SendMessages: hasSendMessagesPermission });

        message.react(client.getEmoji("check"));
        message.channel.send({ content: `${client.getEmoji("check")} Başarıyla kanal kilidi ${hasSendMessagesPermission ? 'açıldı' : 'kapatıldı'}.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 15000));
    },
};