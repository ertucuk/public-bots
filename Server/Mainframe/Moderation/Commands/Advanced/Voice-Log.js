const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

const types = {
    "Katılma": '🟢',
    "Ayrılma": '🔴',
    "Taşıma": '🟡',
    "AdminTaşıma": '🟡',
    "AdminKesme": '🟠',
};

module.exports = {
    Name: 'voicelog',
    Aliases: ['voicelog', 'voice-log', 'vl', 'vlog', 'kanal-log', 'kanallog', 'kanalog', 'seslog', 'ses-log'],
    Description: 'Belirttiğiniz üyenin tüm ses log verilerini görüntülersiniz.',
    Usage: 'voicelog <@User/ID>',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.staffs.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const document = await User.findOne({ userID: member.id });
        if (document.VoiceLogs.length < 1) {
            message.reply({ content: `${client.getEmoji("mark")} Veri bulunamadı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        let Page = 1;
        const totalPages = Math.ceil(document.VoiceLogs.length / 10);

        const mappedData = document.VoiceLogs.map((d) => {
            const channel = message.guild.channels.cache.get(d.channelId) || { name: 'deleted-channel' };
            return `${types[d.type]} | <t:${Math.floor(d.time / 1000)}:R>: ${channel.name}`;
        });

        const reversedData = mappedData.reverse();

        const embed = new EmbedBuilder({
            color: client.random(),
            author: { name: `${member.user.tag} adlı üyenin ses log verileri` },
            footer: { text: `${document.VoiceLogs.length} adet ses verisi mevcut.` },
            description: reversedData.slice(0, 10).join('\n')
        })

        const msg = await message.reply({ embeds: [embed], components: document.VoiceLogs.length > 10 ? [client.getButton(Page, totalPages)] : [] });
        var filter = (i) => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            i.deferUpdate();
            if (i.customId === 'first') Page = 1;
            if (i.customId === 'previous') Page -= 1;
            if (i.customId === 'next') Page += 1;
            if (i.customId === 'last') Page = totalPages;

            const embed = new EmbedBuilder({
                color: client.random(),
                footer: { text: `${document.VoiceLogs.length} adet ses verisi mevcut.` },
                description: reversedData.slice((Page - 1) * 10, Page * 10).join('\n')
            })

            msg.edit({ embeds: [embed], components: [client.getButton(Page, totalPages)] });
        })

        collector.on('end', async () => {
            if (msg) msg.delete().catch(err => { })
        })

    },
};