const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'git',
    Aliases: ['go'],
    Description: 'Belirttiğiniz kullanıcının odasına gidersiniz.',
    Usage: 'git <@User/ID>',
    Category: 'Global',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.member.voice.channelId) {
            message.reply({ content: `Komutu kullanmak için ses kanalında bulunmalısın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!member.voice.channelId) {
            message.reply({ content: `Belirttiğin kullanıcı adlı kullanıcı seste bulunmuyor!` });
            return;
        }

        if (member.voice.channelId === message.member.voice.channelId) {
            message.reply({ content: `Belirttiğin kullanıcı ile aynı kanaldasın.` });
            return;
        }

        if (message.member.permissions.has(Flags.MoveMembers) || message.guild.settings.transporterRoles.some((e) => message.member.roles.cache.has(e))) {
            message.member.voice.setChannel(member.voice.channelId);
            message.reply({ embeds: [new global.VanteEmbed().setDescription(`${client.getEmoji("check")} Başarıyla ${member} adlı üyenin bulunduğu \`${member.voice.channel.name}\` adlı kanala gittiniz.`)] });
        } else {

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('accept').setLabel('Onaylıyorum').setStyle(ButtonStyle.Success).setEmoji('1054856853814788216'),
                    new ButtonBuilder().setCustomId('cancel').setLabel('Onaylamıyorum').setStyle(ButtonStyle.Danger).setEmoji('1057679211021746186')
                );

            const msg = await message.reply({
                content: member.toString(),
                embeds: [new global.VanteEmbed().setDescription(`${message.author} adlı üye \`${member.voice.channel.name}\` kanalına gelmek istiyor. Onaylıyor musun? İşlem 30 saniye sonra iptal edilecektir.`)],
                components: [row],
            });

            const filter = (i) => i.user.id === member.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'accept') {
                    message.member.voice.setChannel(member.voice.channelId);
                    message.react(`${client.getEmoji("check")}`)
                    msg.edit({ embeds: [new global.VanteEmbed().setDescription(`${client.getEmoji("check")} Başarıyla ${member} adlı üyenin bulunduğu \`${member.voice.channel.name}\` adlı kanala gittiniz.`)], components: [] });
                } else if (i.customId === 'cancel') {
                    message.react(`${client.getEmoji("mark")}`)
                    msg.edit({ embeds: [new global.VanteEmbed().setDescription(`${client.getEmoji("mark")} ${member} adlı kullanıcı ${message.author} adlı kullanıcının isteğini onaylamadığı için işlem iptal edildi.`)], components: [] });
                }
            })
        }
    },
};
