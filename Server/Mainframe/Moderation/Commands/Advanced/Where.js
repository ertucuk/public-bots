const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    Name: 'nerede',
    Aliases: ['n'],
    Description: 'Bu kullanıcı hangi kanalda?',
    Usage: 'nerede <@User/ID>',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (!message.guild.settings.staffs.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const channel = member.voice.channel;
        if (!channel) {
            message.reply({ content: `${client.getEmoji("mark")} Belirttiğiniz üye bir ses kanalında değil.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const embed = new global.VanteEmbed()
            .setDescription(`${member} adlı üye şu anda <#${channel.id}> adlı kanalda.`)
            .addFields([
                {
                    name: 'Kullanıcı Bilgileri', value: `
                        Mikrofon Durumu: ${member.voice.mute ? member.voice.selfMute ? 'Kapalı!' : 'Kapalı! (Sunucu)' : 'Açık!'}
                        Kulaklık Durumu: ${member.voice.deaf ? member.voice.selfDeaf ? 'Kapalı!' : 'Kapalı! (Sunucu)' : 'Açık!'}
                        Ekran Durumu: ${member.voice.streaming ? 'Açık!' : 'Kapalı!'}
                        Kamera Durumu: ${member.voice.selfVideo ? 'Açık!' : 'Kapalı!'}
                        Doluluk Durumu: ${`${member.voice.channel.members.size}/${member.voice.channel.userLimit || '~'}`}
                    `, inline: true
                },
                {
                    name: 'Seste Bulunan Kullanıcılar',
                    value: `${member.voice.channel.members.size > 1 ? member.voice.channel.members.filter((m) => m.id !== member.id).map((m) => m.user.toString()).slice(0, 20).join('\n') : 'Bu kanalda hiç kimse yok.'}`,
                    inline: false,
                },
            ]);

        message.channel.send({ embeds: [embed] });

    },
};