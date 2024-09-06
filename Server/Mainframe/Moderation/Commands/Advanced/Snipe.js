const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, Embed, EmbedBuilder, bold } = require('discord.js');
const { Snipe } = require('../../../../Global/Settings/Schemas')
const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');

module.exports = {
    Name: 'snipe',
    Aliases: ['sn'],
    Description: 'Silinen son 10 mesajı listeler.',
    Usage: 'snipe',
    Category: 'Staff',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.staffs.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const data = await Snipe.findOne({ guildID: message.guild.id });
        if (!data) {
            message.reply({ content: `${client.getEmoji("mark")} Sunucuda silinen mesaj bulunamadı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (args[0]) {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) {
                message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
                return;
            }

            const document = await Snipe.findOne({ guildID: message.guild.id })
            const data = Object.values(document.deletedMessages).reverse()
            const filteredData = [];
            let Page = 1;

            for (const mId in data) {
                if (data.hasOwnProperty(mId)) {
                    const m = data[mId];
                    if (m.author.id === member.id) {
                        filteredData.push(m)
                    }
                }
            }

            const totalPages = Math.ceil(filteredData.length / 5);
            if (filteredData.length === 0) {
                message.reply({ content: `${client.getEmoji("mark")} Belirtilen üyenin silinen mesajı bulunamadı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
                return;
            }

            const msg = await message.reply({
                embeds: [showPage(filteredData.length, member, filteredData.slice(Page === 1 ? 0 : Page * 5 - 5, Page * 5))],
                components: [client.getButton(Page, totalPages)]
            })

            const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 60000 });
            collector.on('collect', async i => {
                i.deferUpdate();
                if (i.customId === 'first') Page = 1;
                if (i.customId === 'previous') Page -= 1;
                if (i.customId === 'next') Page += 1;
                if (i.customId === 'last') Page = totalPages;

                const embed = showPage(filteredData.length, member, filteredData.slice(Page === 1 ? 0 : Page * 5 - 5, Page * 5));
                msg.edit({ embeds: [embed], components: [client.getButton(Page, totalPages)] }).then(x => { setTimeout(() => { x.delete() }, 60000) })
            });
        } else {
            const allSnipedMessages = data ? Object.values(data.deletedMessages) : [];
            const snipedMessages = allSnipedMessages.slice(-15).reverse();

            if (snipedMessages.length === 0) {
                message.reply({ content: `${client.getEmoji("mark")} Sunucuda silinen mesaj bulunamadı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
                return;
            }

            const selectMenuOptions = snipedMessages.map((msg, index) => {
                let contentLabel = msg.content;
                if (msg.content.includes('.eval')) return;
                if (msg.content.includes("tenor.com")) {
                    contentLabel = "GIF";
                } else if (msg.content.includes('https://media.discordapp.net/')) {
                    contentLabel = "GIF";
                } else if (msg.content.includes('/cdn.discordapp.com')) {
                    contentLabel = "GIF";
                } else if (msg.content.length > 100) {
                    contentLabel = msg.content.substring(0, 30).trim() + '..';
                }

                return {
                    label: `${msg.author.tag ? msg.author.tag : 'Kullanıcı bulunamadı.'}: ${contentLabel}`,
                    value: index.toString(),
                    description: `Silinme Tarihi: ${moment(msg.timestamp).format('LLL')}`,
                };
            });

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('snipe')
                        .setPlaceholder('Silinen diğer mesajları görmek için tıkla!')
                        .addOptions(selectMenuOptions)
                );

            const lastMessage = snipedMessages[0];
            const embed = new EmbedBuilder({
                color: client.random(),
                author: { name: message.author.displayName, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                image: { url: lastMessage.attachments !== null ? lastMessage.attachments : null },
                title: `Silinen Son Mesaj`,
                description: [
                    `Yazan Kişi: <@${lastMessage.author.id}>`,
                    `Silinme Tarihi: ${client.timestamp(lastMessage.timestamp, 'f')} (${client.timestamp(lastMessage.timestamp)})`,
                    `Mesaj İçeriği: ${bold(lastMessage.content.length > 100 ? lastMessage.content.substring(0, 60).trim() + '..' : lastMessage.content)}`,
                ].join('\n'),
            })

            message.channel.send({ embeds: [embed], components: [row] }).then(async msg => {
                setTimeout(async () => {
                    if (msg && msg.deletable) await msg.delete();
                }, 30000);
            });
        }
    },
};

function showPage(data, member, pageData) {
    const messageList = pageData.map((message) =>
        `Mesaj İçeriği: ${bold(message.content.length > 100 ? message.content.substring(0, 60).trim() + '..' : message.content)}\n` +
        `Silinme Tarihi: ${client.timestamp(message.timestamp, 'f')} (${client.timestamp(message.timestamp)})${message.attachments ? "\n" : ""}` +
        `${message.attachments !== null ? `Dosya: [Dosyaya tıkla!](${message.attachments})` : ''}\n` +
        '---------------------------------'
    ).join('\n');

    const embed = new EmbedBuilder({
        footer: { text: `Toplam ${data} silinen mesaj bulundu.`, iconURL: member.user.displayAvatarURL({ dynamic: true }) },
        thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
        color: client.random(),
        author: { name: `Son silinen mesajlar | ${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) },
        description: messageList,
    });

    return embed;
}