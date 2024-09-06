const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: 'istila',
    Aliases: ['otorol'],
    Description: 'Otorolü tekrardan aktif hale getirir.',
    Usage: 'istila',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("Open").setLabel("Aç").setDisabled(message.guild.settings.fastLogin ? true : false).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("Off").setLabel("Kapat").setDisabled(message.guild.settings.fastLogin ? false : true).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("Cancel").setLabel("İptal").setStyle(ButtonStyle.Danger),
        );

        const embed = new EmbedBuilder({
            color: client.random(),
            thumbnail: { url: message.guild.iconURL({ dynamic: true }) },
            author: { name: message.member.displayName, iconURL: message.member.user.displayAvatarURL({ dynamic: true }) },
            footer: { text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) },
            description: `Sunucuya fake hesap istilası olması durumunda otomatik olarak otorol işlemi kapatıldığı için tekrardan aktif hale getirilmesi için aşağıdaki butonları kullanabilirsin.
            \`\`\`ansi\n[2;36mRol dağıtma işlemi şuan:[0m (${message.guild.settings.fastLogin ? `[2;34m[1;34m[1;32mAçık[0m[1;34m[0m[2;34m[0m` : `[1;2m[1;2m[1;2m[1;2m[1;2m[1;35mKapalı[0m[0m[0m[0m[0m[0m`})\n\`\`\`
            `
        })

        let msg = await message.channel.send({ embeds: [embed], components: [row] });
        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            if (i.customId === "Open") {
                message.guild.settings.fastLogin = true;
                message.guild.settings.save().catch()
                const embed = new EmbedBuilder({
                    color: client.random(),
                    title: 'Otorol İstilası',
                    description: 'Otorol istilası tekrardan aktif hale getirildi. Artık rol dağıtmıyacak.',
                    footer: { text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }
                })
                msg.edit({ embeds: [embed], components: [] });
            } else if (i.customId === "Off") {
                message.guild.settings.fastLogin = false;
                message.guild.settings.save().catch()
                const embed = new EmbedBuilder({
                    color: client.random(),
                    title: 'Otorol İstilası',
                    description: 'Otorol istilası tekrardan pasif hale getirildi. Rol dağıtıcak.',
                    footer: { text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }
                })
                msg.edit({ embeds: [embed], components: [] });
            } else if (i.customId === "Cancel") {
                msg.edit({ content: 'İşlem iptal edildi.', components: [] });
            }
        });
    }
};