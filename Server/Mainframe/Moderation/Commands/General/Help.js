const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, AttachmentBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    Name: 'yardım',
    Aliases: ['help', 'yardim', 'komutlar', 'commands'],
    Description: 'Botun komutlarını gösterir.',
    Usage: 'yardım',
    Category: 'Global',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        var command = args[0]
        if (client.commands.has(command)) {
            command = client.commands.get(command)
            const embed = new EmbedBuilder().setAuthor({
                name: `${client.user.username} | Komut Bilgisi`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            }).setDescription(`${client.getEmoji('check')} Belirttiğin komuta ait bilgiler aşağıda verilmiştir!
    
                **\` • \`** Komut Adı: **${command.Name}**
                **\` • \`** Komut Açıklaması: **${command.Description}**
                **\` • \`** Komut Alternatifleri: **${command.Aliases[0] ? command.Aliases.listArray() : `Alternatif bulunmuyor!`
                }**`)
            return message.reply({ embeds: [embed] })
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user.username} | Komut Bilgisi`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setDescription(
                `${client.getEmoji('check')} Sunucuda kullanabileceğiniz komutlar aşağıda listelenmiştir. Toplamda **${client.commands.size
                }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <komut>** komutunu kullanabilirsiniz.`
            )
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help')
                .setPlaceholder('Bir kategori seçin...')
                .addOptions([
                    {
                        label: 'Kullanıcı Komutları',
                        description: 'Sunucu içerisindeki kullanıcı komutlarını gösterir.',
                        value: 'Global'
                    },
                    {
                        label: 'Eğlence Komutları',
                        description: 'Sunucu içerisindeki eğlence komutlarını gösterir.',
                        value: 'Economy'
                    },
                    {
                        label: 'Kayıt Komutları',
                        description: 'Sunucu içerisindeki kayıt komutlarını gösterir.',
                        value: 'Register'
                    },
                    {
                        label: 'Moderasyon Komutları',
                        description: 'Sunucu içerisindeki moderasyon komutlarını gösterir.',
                        value: 'Moderation'
                    },
                    {
                        label: 'İstatistik Komutları',
                        description: 'Sunucu içerisindeki istatistik komutlarını gösterir.',
                        value: 'Stat'
                    },
                    {
                        label: 'Yetkili Komutları',
                        description: 'Sunucu içerisindeki yetkili ve yönetim komutlarını gösterir.',
                        value: 'Staff'
                    },
                    {
                        label: 'Kurucu Komutları',
                        description: 'Sunucu içerisindeki kurucu komutlarını gösterir.',
                        value: 'Root'
                    }
                ])
        )

        const msg = await message.channel.send({ embeds: [embed], components: [row] })
        const filter = (interaction) => interaction.user.id === message.author.id
        const collector = msg.createMessageComponentCollector({ filter, time: 30 * 1000 })

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'help') {
                await interaction.deferUpdate()
                const helpType = interaction.values[0]
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user.username} | Komut Bilgisi`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    })
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))

                var name, value, name2, value2, description
                switch (helpType) {
                    case 'Global':
                        name = 'Kullanıcı Komutları'
                        value = client.commands
                            .filter((x) => x.Category == helpType)
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join('  ')
                        description = `${client.getEmoji(
                            'check'
                        )} Sunucuda kullanabileceğiniz **${name}** aşağıda listelenmiştir. Toplamda **${client.commands.filter((x) => x.Category == helpType).size
                            }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <Komut İsmi>** komutunu kullanabilirsiniz.`
                        break
                    case 'Economy':
                        name = 'Eğlence Komutları'
                        value = client.commands
                            .filter((x) => x.Category == helpType)
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join(' ')
                        description = `${client.getEmoji(
                            'check'
                        )} Sunucuda kullanabileceğiniz **${name}** aşağıda listelenmiştir. Toplamda **${client.commands.filter((x) => x.Category == helpType).size
                            }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <Komut İsmi>** komutunu kullanabilirsiniz.`
                        break
                    case 'Register':
                        name = 'Kayıt Komutları'
                        value = client.commands
                            .filter((x) => x.Category == helpType)
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join(' ')
                        description = `${client.getEmoji(
                            'check'
                        )} Sunucuda kullanabileceğiniz **${name}** aşağıda listelenmiştir. Toplamda **${client.commands.filter((x) => x.Category == helpType).size
                            }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <Komut İsmi>** komutunu kullanabilirsiniz.`
                        break
                    case 'Moderation':
                        name = 'Moderasyon Komutları'
                        value = client.commands
                            .filter((x) => x.Category == helpType)
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join(' ')
                        description = `${client.getEmoji(
                            'check'
                        )} Sunucuda kullanabileceğiniz **${name}** aşağıda listelenmiştir. Toplamda **${client.commands.filter((x) => x.Category == helpType).size
                            }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <Komut İsmi>** komutunu kullanabilirsiniz.`
                        break
                    case 'Staff':
                        name = 'Yetkili Komutları'
                        value = client.commands
                            .filter((x) => x.Category == helpType)
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join(' ')
                            ; (description = `${client.getEmoji(
                                'check'
                            )} Sunucuda kullanabileceğiniz **${name}** aşağıda listelenmiştir. Toplamda **${client.commands.filter((x) => x.Category == helpType).size +
                            client.commands.filter((x) => x.Category === 'Staff').size
                                }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <Komut İsmi>** komutunu kullanabilirsiniz.`),
                                (name2 = 'Yetkili Sistem Komutları')
                        value2 = client.commands
                            .filter((x) => x.Category == 'Auth')
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join(' ')
                        break
                    case 'Root':
                        name = 'Kurucu Komutları'
                        value = client.commands
                            .filter((x) => x.Category == helpType)
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join(' ')
                        description = `${client.getEmoji(
                            'check'
                        )} Sunucuda kullanabileceğiniz **${name}** aşağıda listelenmiştir. Toplamda **${client.commands.filter((x) => x.Category == helpType).size
                            }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <Komut İsmi>** komutunu kullanabilirsiniz.`
                        break

                    case 'Stat':
                        name = 'İstatistik Komutları'
                        value = client.commands
                            .filter((x) => x.Category == helpType)
                            .map((x) => `\n- \` ${x.Usage} \``)
                            .join(' ')
                        description = `${client.getEmoji(
                            'check'
                        )} Sunucuda kullanabileceğiniz **${name}** aşağıda listelenmiştir. Toplamda **${client.commands.filter((x) => x.Category == helpType).size
                            }** adet komut bulunmaktadır. \n\nBir komut hakkında daha fazla bilgi almak için\n**.yardım <Komut İsmi>** komutunu kullanabilirsiniz.`
                        break
                }

                embed.addFields({ name: name, value: value })
                if (helpType === 'Staff') embed.addFields({ name: name2, value: value2 })
                embed.setDescription(description)

                await msg.edit({ embeds: [embed], components: [row] })
            }
        })

        collector.on('end', async () => {
            if (msg.deleted) return
            if (msg) msg.delete()
        })
    },
};
