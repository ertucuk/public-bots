const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'yetkili-başvur',
    Aliases: ['yetkilibaşvur'],
    Description: 'Destek sistemi',
    Usage: 'yetkili-başvur',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder({
                    custom_id: 'auth-support',
                    label: 'Yetkili Başvurusu',
                    style: ButtonStyle.Secondary
                }),
            )

        let content = `Merhaba! Yetkili başvurusu yapmak için aşağıdaki butona tıklayabilirsin.`

        message.channel.send({ content, components: [row] })
    },
};