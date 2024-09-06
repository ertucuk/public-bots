const { PermissionsBitField: { Flags }, ActionRowBuilder, ModalBuilder, Collection, ChannelType, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, AttachmentBuilder, PermissionFlagsBits, EmbedBuilder, bold, BaseInteraction } = require("discord.js")

module.exports.run = async (client, button = BaseInteraction) => {
    const { customId: ID } = button;

    if (ID == 'staff-leave') {
       const message = await button.channel.messages.fetch(button.message.id);

        message.edit({
            content: `${button.user} adlı yetkili, yetkiyi salan kişiyle DM üzerinden iletişime geçti!`,
            components: message.components.map(row =>
                new ActionRowBuilder().addComponents(
                    row.components.map(component => {
                        if (component.type === 2) {
                          return new ButtonBuilder().setCustomId('staff-leave').setLabel(`${button.user.username} İlgileniyor`).setStyle(ButtonStyle.Success).setDisabled(true);
                        }
                        return component;
                    })
                )
            )
        });

        button.reply({ content: 'İşlem başarılı!', ephemeral: true });
    }

    if (ID == 'tag-leave') {
        const message = await button.channel.messages.fetch(button.message.id);

        message.edit({
            content: `${button.user} adlı yetkili, tagı salan kişiyle DM üzerinden iletişime geçti!`,
            components: message.components.map(row =>
                new ActionRowBuilder().addComponents(
                    row.components.map(component => {
                        if (component.type === 2) {
                          return new ButtonBuilder().setCustomId('tag-leave').setLabel(`${button.user.username} İlgileniyor`).setStyle(ButtonStyle.Success).setDisabled(true);
                        }
                        return component;
                    })
                )
            )
        });

        button.reply({ content: 'İşlem başarılı!', ephemeral: true });
    }
}