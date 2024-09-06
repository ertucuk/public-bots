const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, codeBlock, bold } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');
const { table, getBorderCharacters } = require('table')

module.exports = {
    Name: 'market',
    Aliases: ['shop'],
    Description: 'Marketi gösterir.',
    Usage: 'market',
    Category: 'Economy',
    Cooldown: 10,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        if (data.Inventory == null) {
            data.Inventory = { Cash: 0 }
            await data.save()
        }

        const cash = data.Inventory.Cash || 0;

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'ring1',
                    label: 'Pırlanta Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204669831614475',
                    disabled: cash < 50000,
                }),
                new ButtonBuilder({
                    customId: 'ring2',
                    label: 'Baget Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204617058889849',
                    disabled: cash < 150000,
                }),
                new ButtonBuilder({
                    customId: 'ring3',
                    label: 'Tektaş Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204523047755873',
                    disabled: cash < 250000,
                }),
            ]
        })

        const row2 = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'ring4',
                    label: 'Tria Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204472682561586',
                    disabled: cash < 500000,
                }),
                new ButtonBuilder({
                    customId: 'ring5',
                    label: 'Beştaş Yüzük',
                    style: ButtonStyle.Success,
                    emoji: '1168204227110240347',
                    disabled: cash < 1000000,
                }),
                new ButtonBuilder({
                    customId: 'cancel',
                    label: 'İşlemi İptal Et',
                    style: ButtonStyle.Danger,
                    emoji: '❎',
                }),
            ]
        })

        const shopData = [
            { id: '1', name: 'ring1', price: 50000, description: 'Pırlanta Yüzük', amount: 1 },
            { id: '2', name: 'ring2', price: 150000, description: 'Baget Yüzük', amount: 1 },
            { id: '3', name: 'ring3', price: 250000, description: 'Tektaş Yüzük', amount: 1 },
            { id: '4', name: 'ring4', price: 500000, description: 'Tria Yüzük', amount: 1 },
            { id: '5', name: 'ring5', price: 1000000, description: 'Beştaş Yüzük', amount: 1 },
        ]

        let text = [['ID', 'Ürün İsmi', 'Ürün Detayı', 'Ürün Fiyatı']]
        text = text.concat(
            shopData.map((value) => {
                return [`#${value.id}`, `${value.description}`, `${value.amount} Adet`, `${value.price} 💵`]
            })
        )

        const config = {
            border: getBorderCharacters(`void`),
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 1
            },
            columns: {
                0: {
                    paddingLeft: 1
                },
                1: {
                    paddingLeft: 1
                },
                2: {
                    paddingLeft: 1,
                    alignment: 'center'
                },
                3: {
                    paddingLeft: 1,
                    paddingRight: 1
                }
            },

            drawHorizontalLine: (index, size) => {
                return index === 0 || index === 1 || index === size
            }
        }

        const embed = new EmbedBuilder().setFooter({ text: message.guild.name + ' | ' + `Created By Ertu`, iconURL: message.guild.iconURL({ dynamic: true, size: 2048 }) })
            .addFields(
                {
                    name: `Mağaza (\`Bakiye: ${cash ? Math.floor(parseInt(cash)) : 0} 💵\`)`,
                    value: `\`\`\`${table(text, config)}\`\`\``
                },
                {
                    name: `Ürün nasıl satın alabilirim?`,
                    value: `Aşağıda beliren butonlardan yeşil olanlara \`30 Saniye\` içerisinde tıklayarak satın alabilirsin.`
                }
            )
        const msg = await message.channel.send({
            embeds: [embed],
            components: [row, row2]
        })

        const filter = (interaction) => interaction.user.id === message.author.id
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 })

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'cancel') {
                interaction.deferUpdate()
                return collector.stop()
            }

            const item = shopData.find((item) => item.name === interaction.customId)
            if (!item) {
                interaction.deferUpdate()
                return collector.stop()
            }

            if (cash < item.price) {
                interaction.deferUpdate()
                return collector.stop()
            }

            data.Inventory.Cash = cash - item.price
            data.Inventory[item.name] = (data.Inventory[item.name] || 0) + item.amount
            data.markModified('Inventory')
            await data.save()

            interaction.reply({
                content: `${client.getEmoji('check')} Başarıyla **${item.description}** ürününü satın aldınız!`,
                ephemeral: true
            })

            return collector.stop()
        })

        collector.on('end', async (collected, reason) => {
            msg.delete().catch(() => { })
        })
    },
};