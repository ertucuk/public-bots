const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ChannelType, bold, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'sesli',
    Aliases: ['seslisay'],
    Description: 'Sunucuda seslide kaç kişi olduğunu söyler.',
    Usage: 'sesli',
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

        const embed = new EmbedBuilder({
            author: {
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ forceStatic: true }),
            },
        });

        const voiceMembers = message.guild.members.cache.filter((m) => m.voice.channel);
        const taggedMembers = voiceMembers.filter(m => m.roles.cache.has(message.guild.settings.familyRole));
        const staffMembers = voiceMembers.filter(m => m.roles.cache.has(message.guild.settings.registerAuth));
        const streamMembers = voiceMembers.filter(m => m.voice.streaming);
        const mutedMembers = voiceMembers.filter(m => m.voice.channel && m.voice.mute);
        const deafenedMembers = voiceMembers.filter(m => m.voice.channel && m.voice.deaf);

        const publicMembers = voiceMembers.filter(m => m.voice.channel.parentId === message.guild.settings.publicParent);
        const streamerMembers = voiceMembers.filter(m => m.voice.channel.parentId === message.guild.settings.streamerParent);
        const registerMembers = voiceMembers.filter(m => m.voice.channel.parentId === message.guild.settings.registerParent);
        const secretMembers = voiceMembers.filter(m => m.voice.channel.parentId === message.guild.settings.secretRoomParent);
        const funParents = voiceMembers.filter(m => m.voice.channel.parentId === message.guild.settings.activityParent);

        message.reply({
            embeds: [
                embed.addFields(
                    {
                        name: 'Sunucunun Genel Aktifliği',
                        value: [
                            `${client.getEmoji('point')} Toplam ${bold(voiceMembers.size.toString())} üye ses kanallarında.`,
                            `${client.getEmoji('point')} Toplam ${bold(taggedMembers.size.toString())} taglı üye ses kanallarında.`,
                            `${client.getEmoji('point')} Toplam ${bold(staffMembers.size.toString())} yetkili ses kanallarında.`,
                            `${client.getEmoji('point')} Toplam ${bold(streamMembers.size.toString())} üye yayın yapıyor.`,
                            `${client.getEmoji('point')} Toplam ${bold(mutedMembers.size.toString())} üyenin mikrofonu kapalı.`,
                            `${client.getEmoji('point')} Toplam ${bold(deafenedMembers.size.toString())} üyenin kulaklığı kapalı.`,
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: 'Sunucunun Kategori Aktifliği',
                        value: [
                            `${client.getEmoji('point')} Toplam ${bold(publicMembers.size.toString())} üye public odalarda.`,
                            `${client.getEmoji('point')} Toplam ${bold(streamerMembers.size.toString())} üye streamer odalarda.`,
                            `${client.getEmoji('point')} Toplam ${bold(registerMembers.size.toString())} üye register odalarda.`,
                            `${client.getEmoji('point')} Toplam ${bold(secretMembers.size.toString())} üye secret odalarda.`,
                            `${client.getEmoji('point')} Toplam ${bold(funParents.size.toString())} üye eğlence odalarda.`,
                        ].join('\n'),
                        inline: true
                    }
                )
            ]
        })
    },
};