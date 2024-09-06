const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, RoleSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Points } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'puan',
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
                        name: 'puan',
                        description: 'Gerekli Puan',
                        type: ApplicationCommandOptionType.Number,
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
            const point = interaction.options.getNumber('puan');

            const data = await Points.find({});

            if (data.some((x) => x.ROLE == role.id)) return interaction.followUp({ content: 'Bu role zaten puan atanmış.', ephemeral: true });

            const guildRole = interaction.guild.roles.cache.get(role.id);
            const guildExtra = interaction.guild.roles.cache.get(extra.id);

            new Points({
                POSITION: data?.length + 1,
                ROLE: role.id,
                EXTRA_ROLE: guildExtra.id,
                POINT: point
            }).save();

            await interaction.followUp({ content: `Başarıyla ${guildRole} rolüne puan eklendi.`, ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'listele') {
            const db = await Points.find({});
            if (db.length < 1) return interaction.followUp({ content: 'Henüz hiçbir rol atanmamış.', ephemeral: true });

            const options = db.map((data, index) => {
                return {
                  label: `${index + 1} - [${interaction.guild.roles.cache.get(data.ROLE).name}]`,
                  description: `Ekstra Rol: ${data.EXTRA_ROLE.map((x) => interaction.guild.roles.cache.get(x).name).join(', ')}\nPuan: ${data.POINT}`,
                  value: data.ROLE.toString(),
                };
              });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('pointList')
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
            const data = await Points.find({});

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
                .setDescription(`<@&${task.ROLE}> rolü yetkili sisteminden kaldırılacak. Emin misin?`)

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
                        await Points.deleteOne({ ROLE: role.id })

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