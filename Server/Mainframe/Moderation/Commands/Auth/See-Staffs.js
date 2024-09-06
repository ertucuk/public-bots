const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, bold, time, inlineCode, userMention, EmbedBuilder, ComponentType } = require('discord.js');
const { Staff, User } = require('../../../../Global/Settings/Schemas')

module.exports = {
    Name: 'yetkililerim',
    Aliases: ['yetkililerim', 'yetkililer', 'ytlerim', 'ytler'],
    Description: 'Yetkili verilerinizi gösterir.',
    Usage: 'yetkililerim <@User/ID>',
    Category: 'Auth',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        if (member.user.bot) {
            message.reply(global.cevaplar.etiketle).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.guild.settings.staffs.some((r) => member.roles.cache.has(r))) {
            message.reply({ content: `${client.getEmoji('mark')} Yetkili değilsiniz!` })
            return;
        }

        const document = await User.findOne({ userID: member.id })
        if (!document || !document?.Auths.length) {
            message.reply({ content: member.id === message.author.id ? 'Yetkili verin bulunmuyor.' : 'Belirttiğin kullanıcının yetkili verisi bulunmuyor.' })
            return;
        }

        let page = 1
        const totalPages = Math.ceil(document.Auths.length / 10)
        const mappedPages = document.Auths.map((t, i) => `${bold((i + 1).toString())}. ${time(Math.floor(t.timestamp / 1000), 'f')}: ${userMention(t.id)} (${inlineCode(t.id)})`)

        const embed = new EmbedBuilder({
            color: client.random(),
            description: [
                `${member} adlı yetkilinin yetkiye başlattığı kullanıcı bilgileri;\n`,
                mappedPages.slice(0, 10).join('\n')
            ].join('\n'),
            footer: { text: `Sunucumuza ${document.Auths.length} yetkili kazandırmış. Tebrikler!` }
        })

        const question = await message.channel.send({
            embeds: [embed],
            components: document.Auths.length > 5 ? [client.getButton(page, totalPages)] : []
        })

        if (10 >= document.Auths.length) return

        const filter = (i) => i.user.id === message.author.id && i.isButton() && ['previous', 'next'].includes(i.customId)
        const collector = question.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * 5,
            componentType: ComponentType.Button
        })

        collector.on('collect', async (i) => {
            i.deferUpdate();

            if (i.customId === 'first') page = 1;
            else if (i.customId === 'previous') page = Math.max(1, page - 1);
            else if (i.customId === 'next') page = Math.min(totalPages, page + 1);
            else if (i.customId === 'last') page = totalPages;

            question.edit({
                embeds: [embed.setDescription(mappedPages.slice(page === 1 ? 0 : page * 10 - 10, page * 10).join('\n'))],
                components: [client.getButton(page, totalPages)]
            })
        })

        collector.on('end', (_, reason) => {
            if (reason === 'time') question.delete().catch(() => { })
        })
    },
};