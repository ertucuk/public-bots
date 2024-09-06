const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, RoleSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Tasks } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'görev',
    Aliases: [],
    Description: 'Sunucu yetkili kurulumunu ve ayarlarını yapar.',
    Usage: 'staff',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: false,
        Slash: true,
        Ephemeral: true,
        Loading: false,
        Options: [
            {
                name: 'ekle',
                description: 'Yetkili sistemine bir yetkili rolü ekler.',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'rol',
                        description: 'Eklenecek Rol',
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    },
                    {
                        name: 'ekstra',
                        description: 'Eklenecek Ekstra Rol',
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    },
                    {
                        name: 'gün',
                        description: 'Yetki Süresi (Gün)',
                        type: ApplicationCommandOptionType.Integer,
                        required: true
                    },
                ]
            },
            {
                name: 'listele',
                description: 'Yetkili sistemindeki yetkili rollerini listeler.',
                type: ApplicationCommandOptionType.Subcommand,
                options: []
            },
            {
                name: 'kaldır',
                description: 'Yetkili sisteminden bir yetkili rolü kaldırır.',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'rol',
                        description: 'Kaldırılacak Rol',
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ]
            }
        ]
    },

    messageRun: async (client, message, args) => { },

    interactionRun: async (client, interaction) => {
        const role = interaction.options.getRole('rol');

        if (interaction.options.getSubcommand() === 'ekle') {
            const extra = interaction.options.getRole('ekstra');
            const day = interaction.options.getInteger('gün');

            const data = await Tasks.find({});

            if (data.some((x) => x.ROLE == role.id)) return interaction.followUp({ content: `Bu role zaten görev atanmış.`, ephemeral: true });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder({
                    customId: 'continue',
                    style: ButtonStyle.Primary,
                    label: 'Devam etmek için tıkla'
                }),
                new ButtonBuilder({
                    customId: 'cancel',
                    style: ButtonStyle.Danger,
                    label: 'İşlemi iptal et'
                })
            );

            const embeds = new EmbedBuilder({
                color: 0x2b2d31,
                title: 'Görev Bilgileri',
                fields: [
                    {
                        name: 'Rol',
                        value: role.toString(),
                        inline: true
                    },
                    {
                        name: 'Ekstra Rol',
                        value: extra.toString(),
                        inline: true
                    },
                    {
                        name: 'Gün',
                        value: day,
                        inline: true
                    }
                ]
            });

            const i = await interaction.followUp({ embeds: [embeds], components: [row] });
            var filter = (i) => i.user.id === interaction.user.id;
            var collector = i.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'continue') {
                    const modal = new ModalBuilder({
                        customId: 'addTask',
                        title: 'Görev Ekle',
                    });

                    const inputs = [
                        new TextInputBuilder({
                            customId: 'roleId',
                            value: `${role.id}, ${extra.id}, ${day}`,
                            label: 'Rol ID & Ekstra Rol ID & Gün',
                            style: TextInputStyle.Short,
                            required: false
                        }),

                        new TextInputBuilder({
                            customId: 'messageTask',
                            placeholder: 'Örnek: 10',
                            label: 'Mesaj Görevi',
                            style: TextInputStyle.Short,
                            required: false
                        }),

                        new TextInputBuilder({
                            customId: 'afkTask',
                            placeholder: 'Örnek: 10',
                            label: 'Afk Ses Görevi',
                            style: TextInputStyle.Short,
                            required: false
                        }),

                        new TextInputBuilder({
                            customId: 'publicTask',
                            placeholder: 'Örnek: 10',
                            label: 'Public Görevi',
                            style: TextInputStyle.Short,
                            required: false
                        }),

                        new TextInputBuilder({
                            customId: 'streamerTask',
                            placeholder: 'Örnek: 10',
                            label: 'Streamer Görevi',
                            style: TextInputStyle.Short,
                            required: false
                        }),
                    ]

                    const rows = inputs.map((input) => new ActionRowBuilder().addComponents(input))

                    modal.addComponents(...rows);

                    i.showModal(modal);
                } else if (i.customId === 'cancel') {
                    await i.deferUpdate();
                    await i.editReply({ content: 'İşlem iptal edildi.', embeds: [], components: [] });
                }
            });
        }


        if (interaction.options.getSubcommand() === 'listele') {
            const db = await Tasks.find({});
            if (db.length < 1) return interaction.followUp({ content: 'Henüz hiçbir rol atanmamış.', ephemeral: true });

            const options = db.map((data, index) => {
                return {
                  label: `${index + 1} - [${interaction.guild.roles.cache.get(data.ROLE).name}]`,
                  description: `Ekstra Rol: ${data.EXTRA_ROLE.map((x) => interaction.guild.roles.cache.get(x).name).join(', ')}\nGün: ${data.DAY}`,
                  value: data.ROLE.toString(),
                };
              });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('staffList')
                .setPlaceholder('Bir rol seçin...')
                .addOptions(options.slice(0, 25));

            const embed = new EmbedBuilder({
                color: 0x2b2d31,
                title: 'Görev Listesi',
                description: 'Aşağıda yetkili rolleri listelenmiştir.'
            });  

            await interaction.followUp({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
        }

        if (interaction.options.getSubcommand() === 'kaldır') {
            const data = await Tasks.find({});

            if (!data.some((x) => x.ROLE == role.id)) {
                return interaction.followUp({
                    content: `Bu role görev atanmamış.`,
                    ephemeral: true
                })
            }

            const task = data.find((x) => x.ROLE == role.id)

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle('Emin misin?')
                .setDescription(`<@&${task.ROLE}> rolü için atanmış aşağıda listelenen görevler silinecek.`)
                .addFields({
                    name: 'Görevler',
                    value: task.REQUIRED_TASKS.map((x) => `- **${x.NAME}**`).join('\n')
                })

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('approveDeleteTask')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Evet Sil'),
                new ButtonBuilder()
                    .setCustomId('cancelDeleteTask')
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel('Vazgeç')
            )

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            }).then(async (message) => {
                const collector = message.createMessageComponentCollector()

                collector.on('collect', async (i) => {
                    if (i.customId == 'approveDeleteTask') {
                        await Tasks.deleteOne({ ROLE: role.id });

                        await i.update({
                            content: `Başarıyla ${role} rolü yetkili sisteminden kaldırıldı.`,
                            embeds: [],
                            components: []
                        })
                    }

                    if (i.customId == 'cancelDeleteTask') {
                        await i.update({
                            content: `İşlem iptal edildi.`,
                            embeds: [],
                            components: []
                        })
                    }
                })
            })
        }
    }
};