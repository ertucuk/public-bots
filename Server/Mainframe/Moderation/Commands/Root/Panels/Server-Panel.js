const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, inlineCode, bold, EmbedBuilder, Collection } = require('discord.js');

module.exports = {
    Name: 'sunucupanel',
    Aliases: ['sunucupanel', 'sunucupaneli'],
    Description: 'Sunucu paneli.',
    Usage: 'sunucupanel',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('sunucupanel')
                    .setPlaceholder('Sunucu Paneli')
                    .addOptions([
                        {
                            label: 'DM Mesaj',
                            value: 'dm',
                            description: 'İstediğiniz roldeki kişilere mesaj yollar.',
                        },
                        {
                            label: 'Rol Al',
                            value: 'rolal',
                            description: 'İstediğiniz roldekilerden rolü alır.',
                        },
                    ])
            );

        const msg = await message.channel.send({ content: 'İstediğiniz işlemi seçiniz!', components: [row] });
        var collector = msg.createMessageComponentCollector({ filter: (menu) => menu.user.id === message.author.id, time: 60000 });

        collector.on('collect', async (menu) => {
            menu.deferUpdate();

            if (menu.values[0] === 'dm') {
                const load = await msg.channel.send({ content: 'Hangi roldeki kişilere mesaj atmak istersiniz? İptal etmek için `iptal` yazınız.' });
                if (msg) msg.delete().catch(() => { });
                
                const collector = load.channel.createMessageCollector({ filter: (m) => m.author.id === message.author.id, time: 60000, max: 1 });
                collector.on('collect', async (m) => {
                    if (['iptal', 'i', 'cancel'].some((content) => m.content.toLowerCase() === content)) {
                        if (m) m.react(client.getEmoji('check'));
                        return collector.stop()
                    }

                    if (m.content) {
                        const role = m.mentions.roles.first() || m.guild.roles.cache.get(m.content);
                        if (!role) {
                            m.reply({ content: 'Geçerli bir rol belirtmelisin.' });
                            return collector.stop();
                        }

                        const members = m.guild.members.cache.filter(member => member.roles.cache.has(role.id));
                        if (members.size === 0) return m.reply({ content: 'Bu rolde hiç üye yok.' });

                        const load = await m.reply({ content: `${inlineCode(role.name)} rolündeki ${bold(members.size)} kişiye mesaj göndermek istediğiniz mesajı yazınız. İptal etmek için \`iptal\` yazınız.` });
                        const collector = load.channel.createMessageCollector({ filter: (m) => m.author.id === message.author.id, time: 60000, max: 1 });
                        collector.on('collect', async (m) => {
                            if (['iptal', 'i', 'cancel'].some((content) => m.content.toLowerCase() === content)) {
                                if (m) m.react(client.getEmoji('check'));
                                return collector.stop()
                            }

                            let failedCount = 0;
                            let description = '';

                            const promises = members.map(member =>
                                member.send({ content: m.content }).catch(() => {
                                    failedCount++;
                                    console.log(`${member.user.username} adlı üyeye mesaj gönderilemedi.`);
                                })
                            );

                            await Promise.all(promises);

                            if (failedCount > 0) {
                                description = `Başarıyla toplam ${bold(members.size)} arasından ${bold(members.size - failedCount)} kişiye mesaj gönderildi. ${bold(failedCount)} kişiye mesaj gönderilemedi.`;
                            } else {
                                description = `Başarıyla toplam ${bold(members.size)} arasından ${members.size} kişiye mesaj gönderildi.`;
                            }

                            message.channel.send({ content: description });
                        });
                    }
                });

            } else if (menu.values[0] === 'rolal') {
                const load = await msg.channel.send({ content: 'Hangi roldeki kişilerden rol almak istersiniz? İptal etmek için `iptal` yazınız.' });
                if (msg) msg.delete().catch(() => { });

                const collector = load.channel.createMessageCollector({ filter: (m) => m.author.id === message.author.id, time: 60000, max: 1 });
                collector.on('collect', async (m) => {
                    if (['iptal', 'i', 'cancel'].some((content) => m.content.toLowerCase() === content)) {
                        if (m) m.react(client.getEmoji('check'));
                        return collector.stop()
                    }

                    if (m.content) {
                        const role = m.mentions.roles.first() || m.guild.roles.cache.get(m.content);
                        if (!role) {
                            m.reply({ content: 'Geçerli bir rol belirtmelisin.' });
                            return collector.stop();
                        }

                        const members = m.guild.members.cache.filter(member => member.roles.cache.has(role.id));
                        if (members.size === 0) return m.reply({ content: 'Bu rolde hiç üye yok.' });

                        const promises = members.map(member => member.roles.remove(role.id).catch(() => {
                            console.log(`${member.user.username} adlı üyeden rol alınamadı.`);
                        }));

                        await Promise.all(promises);
                        if (load) load.delete().catch(() => { });
                        message.channel.send({ content: `${bold(members.size)} kişiden ${inlineCode(role.name)} rolü alındı.` });
                    }
                });
            }
        });
    },
};