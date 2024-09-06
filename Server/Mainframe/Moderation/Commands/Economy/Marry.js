const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'evlen',
    Aliases: ['marry'],
    Description: 'Kullanıcıyı evlendirir.',
    Usage: 'evlen <@User/ID> <yüzük 1-5>',
    Category: 'General',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        if (data.Marriage.active === true) {
            message.reply({ content: 'Zaten evlisiniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (data.Inventory == null) {
            data.Inventory = { Cash: 0 }
            await data.save()
        }

        const user = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (!user) {
            message.reply({ content: 'Lütfen evlenmek istediğiniz kişiyi belirtiniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (user.id === message.author.id) {
            message.reply({ content: 'Kendinizle evlenemezsiniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        const ring = Number(args[1])
        if (isNaN(ring)) {
            message.reply({ content: 'Lütfen geçerli bir yüzük belirtiniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (ring < 1 || ring > 5) {
            message.reply({ content: 'Yüzük 1-5 arasında olabilir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (data.Inventory[`ring${ring}`] === 0) {
            message.reply({ content: 'Belirttiğin yüzük sende bulunmamaktadır.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        } 

        const userData = (await User.findOne({ userID: user.id })) || new User({ userID: user.id })
        if (userData.Inventory == null) {
            userData.Inventory = { Cash: 0 }
            await userData.save()
        }

        if (userData.Marriage.active === true) {
            message.reply({ content: 'Kullanıcı zaten evli.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (client.system.ownerID.includes(message.author.id)) {
            data.Inventory[`ring${ring}`] -= 1
            data.Marriage.active = true
            data.Marriage.married = user.id
            data.Marriage.date = Date.now()
            data.Marriage.ring = ring
            data.markModified('Inventory')
            data.markModified('Marriage')
            await data.save()

            userData.Marriage.active = true
            userData.Marriage.married = message.author.id
            userData.Marriage.date = Date.now()
            userData.Marriage.ring = ring
            userData.markModified('Marriage')
            await userData.save()

            message.channel.send({ content: `🎀💞💗 Tebrikler! ${user} ile direkt evlendin. (BOT SAHİP)` })
            return;
        }

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: 'yes',
                    label: 'Evet',
                    style: ButtonStyle.Success
                }),

                new ButtonBuilder({
                    customId: 'no',
                    label: 'Hayır',
                    style: ButtonStyle.Danger
                })
            ]
        })

        const embed = new EmbedBuilder({
            author: { name: `${message.author.username}, ${user.username} kullanıcısına ${ring == 1 ? 'Pırlanta' : ring == 2 ? 'Baget' : ring == 3 ? 'Tektaş' : ring == 4 ? 'Tria' : 'Beştaş'} Yüzükle evlenme teklifi etti!`, },
            thumbnail: { url: `${ring == 1 ? 'https://cdn.discordapp.com/emojis/590393334384558110' : ring == 2 ? 'https://cdn.discordapp.com/emojis/590393334036693004' : ring == 3 ? 'https://cdn.discordapp.com/emojis/590393334003138570' : ring == 4 ? 'https://cdn.discordapp.com/emojis/590393335819272203.gif' : 'https://cdn.discordapp.com/emojis/590393335915479040.gif'}` },
            description: `:tada: Vaov! Vaov! Vaov! ${user} görünüşe göre ${message.author} size ${ring == 1 ? '**Pırlanta**' : ring == 2 ? '**Baget**' : ring == 3 ? '**Tektaş**' : ring == 4 ? '**Tria**' : '**Beştaş**'} Yüzükle evlenme teklifi etti! Kabul etmek veya reddetmek için aşağıdaki butonlara basmanız gerekmektedir. Ne zaman ayrılmak isterseniz **.boşan** yazarak ayrılabilirsiniz. Şimdiden mutluluklar!`,
            timestamp: new Date()
        })

        const msg = await message.channel.send({
            content: `${user}`,
            embeds: [embed],
            components: [row]
        })

        const filter = (button) => button.user.id === user.id
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 })

        collector.on('collect', async (button) => {
            if (button.customId === 'yes') {
                data.Inventory[`ring${ring}`] -= 1
                data.Marriage.active = true
                data.Marriage.married = user.id
                data.Marriage.date = Date.now()
                data.Marriage.ring = ring
                data.markModified('Inventory')
                data.markModified('Marriage')
                await data.save()

                userData.Marriage.active = true
                userData.Marriage.married = message.author.id
                userData.Marriage.date = Date.now()
                userData.Marriage.ring = ring
                userData.markModified('Marriage')
                await userData.save()

                if (msg) msg.delete();
                message.channel.send({ content: `🎀 💞 💗 Tebrikler! ${user} evlenme teklifini kabul etti.` })
                collector.stop()
            } else if (button.customId === 'no') {
                if (msg) msg.delete();
                message.channel.send({ content: `${client.getEmoji('mark')} ${user} evlenme teklifini reddetti.` })
                collector.stop()
            }
        })

        collector.on('end', async () => {
            if (!msg.deleted) msg.delete().catch(() => { })
        })
    },
};
