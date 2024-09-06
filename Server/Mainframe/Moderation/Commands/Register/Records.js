const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'kayıtlarım',
    Aliases: ['teyit', 'kayıtbilgi', 'kayitbilgi', 'kayit-bilgi', 'teyit-bilgi', 'kayitlarim', 'kayıtlarım', 'teyitlerim', 'teyitler'],
    Description: 'Belirtilen üyenin teyit bilgilerini gösterir.',
    Usage: 'kayıtlarım   <@User/ID>',
    Category: 'Register',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.registerAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const userData = await User.findOne({ userID: member.id })
        if (!userData) return message.reply({ content: 'Belirtilen üyenin veritabanında kayıtlı bir verisi bulunamadı.' }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (!userData.Records) return message.reply({ content: 'Belirtilen üyenin veritabanında kayıtlı bir verisi bulunamadı.' }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const manRecord = userData.Records.filter(x => x.Gender === 'Male').length
        const womanRecord = userData.Records.filter(x => x.Gender === 'Girl').length

        const List = userData.Records.filter(x => message.guild.members.cache.get(x.User)).map((x) => {
            return `[<t:${Math.floor(x.Date / 1000)}:R>] ${message.guild.members.cache.get(x.User)} (**${x.Gender === 'Male' ? 'ERKEK' : 'KADIN'}**)`;
        });

        let Page = 1;
        const totalPages = Math.ceil(List.length / 10);

        const embed = new EmbedBuilder({
            color: client.random(),
            author: { name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
            description: `${member} üyesinin toplam **${userData.Records.length}** kayıtı bulunmakta. **${manRecord}** Erkek, **${womanRecord}** Kadın.\n\n${List.slice(Page === 1 ? 0 : Page * 10 - 10, Page * 10).join("\n")}`
        })

        if (List.length < 10) {
            return message.channel.send({ embeds: [embed] })
        } else if (List.length >= 10) {
            var msg = await message.channel.send({ embeds: [embed], components: List.length >= 10 ? [client.getButton(Page, totalPages)] : [] })
        }

        if (msg) {
            const filter = (i) => i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 })

            collector.on('collect', async i => {

                i.deferUpdate();
                if (i.customId === 'first') Page = 1;
                if (i.customId === 'previous') Page -= 1;
                if (i.customId === 'next') Page += 1;
                if (i.customId === 'last') Page = totalPages;

                msg.edit({ embeds: [embed.setDescription(List.slice(Page === 1 ? 0 : Page * 10 - 10, Page * 10).join("\n"))], components: [client.getButton(Page, totalPages)] });
            })

            collector.on('end', async () => {
                if (msg) msg.delete().catch(err => { })
            })
        }
    },
};