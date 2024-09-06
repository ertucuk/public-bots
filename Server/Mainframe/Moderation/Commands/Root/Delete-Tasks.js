const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Staff } = require('../../../../Global/Settings/Schemas')

module.exports = {
    Name: 'görevresetle',
    Aliases: ['görevlerisil'],
    Description: 'görevleri yeniden başlatır',
    Usage: 'görevresetle',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (args[0]) {
            const document = await Staff.findOne({ id: member.id })
            if (!document || document.tasks.length < 1) return message.reply({ content: `${client.getEmoji("mark")} Belirtilen üyenin görevi bulunamadı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

            await Staff.updateOne({ id: member.id }, { $set: { tasks: [] }, $unset: { roleStarted: 0 } });
            message.reply({ content: 'Görevler başarıyla sıfırlandı.' });
        } else {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('accept').setLabel('Onaylıyorum').setStyle(ButtonStyle.Success).setEmoji('1054856853814788216'),
                    new ButtonBuilder().setCustomId('cancel').setLabel('Onaylamıyorum').setStyle(ButtonStyle.Danger).setEmoji('1057679211021746186')
                );

            const msg = await message.reply({
                content: `Görevleri sıfırlamak istediğinize emin misiniz? (Tüm sunucudaki üyelerin görevleri sıfırlanacaktır. Bu işlem geri alınamaz.)`,
                components: [row],
            });

            const filter = (i) => i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'accept') {
                    await Staff.updateMany({}, { $set: { tasks: [] }, $unset: { roleStarted: 0 } });
                    msg.edit({ content: `Görevler başarıyla sıfırlandı.`, components: [] });
                } else if (i.customId === 'cancel') {
                    msg.edit({ content: `Görev sıfırlama işlemi iptal edildi.`, components: [] });
                }
            })
        }
    },
};