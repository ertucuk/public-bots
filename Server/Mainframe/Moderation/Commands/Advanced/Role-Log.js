const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

const types = {
    "AdminEkleme": `${client.getEmoji("up")}`,
    "AdminÇıkarma": `${client.getEmoji("down")}`,
};

module.exports = {
    Name: 'rollog',
    Aliases: ['rollog', 'rol-log', 'rl', 'rlog'],
    Description: 'Belirttiğiniz üyenin tüm rol log verilerini görüntülersiniz.',
    Usage: 'rollog <@User/ID>',
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
        if (document.RoleLogs.length < 1) {
            message.reply({ content: `${client.getEmoji("mark")} Veri bulunamadı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        let Page = 1;
        const totalPages = Math.ceil(document.RoleLogs.length / 10);

        const mappedData = document.RoleLogs.map((d) => {
            return `${d.admin ? `<@${d.admin}>` : 'Bulunamadı.'} ${types[d.type]} | ${d.roles.map(roleMention).join(',')} | <t:${Math.floor(d.time / 1000)}:R>`;
        });

        const reversedData = mappedData.reverse();

        const embed = new EmbedBuilder({
            color: client.random(),
            author: { name: `${member.user.tag} adlı üyenin rol log verileri` },
            footer: { text: `${document.RoleLogs.length} adet rol güncellemesi mevcut.` },
            description: reversedData.slice(0, 10).join('\n')
        })

        const msg = await message.reply({ embeds: [embed], components: document.RoleLogs.length > 10 ? [client.getButton(Page, totalPages)] : [] });
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
                footer: { text: `${document.RoleLogs.length} adet rol güncellemesi mevcut.` },
                description: reversedData.slice((Page - 1) * 10, Page * 10).join('\n')
            })
           
            msg.edit({ embeds: [embed], components: [client.getButton(Page, totalPages)] });
        })

        collector.on('end', async () => {
            if (msg) msg.delete().catch(err => { })
        })
    },
};

function roleMention(roleId) {
    return `<@&${roleId}>`;
}