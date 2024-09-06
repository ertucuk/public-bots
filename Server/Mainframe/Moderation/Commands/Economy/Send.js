const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, codeBlock, bold } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'paragönder',
    Aliases: ['paragonder', 'pg', 'para-gönder', 'para-gonder'],
    Description: 'Belirtilen kişiye para gönderir.',
    Usage: 'paragönder <@User/ID> <miktar>',
    Category: 'Economy',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.`}).then((e) => setTimeout(() => { e.delete(); }, 10000)); 
            return;
        }

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        if (data.Inventory == null) {
            data.Inventory = { Cash: 0 }
            await data.save()
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.bot).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        let amount = Number(args[1])
        if (isNaN(amount)) {
            message.reply({ content: 'Lütfen geçerli bir miktar giriniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (amount <= 0) {
            message.reply({ content: 'Belirttiğiniz miktar geçersizdir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        if (amount > data.Inventory.Cash) {
            message.reply({ content: 'Yeterli paranız bulunmamaktadır.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Onayla')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('İptal')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❎'),
            );

        const msg = await message.reply({
            embeds: [
                new EmbedBuilder({
                    thumbnail: { url: member.displayAvatarURL({ dynamic: true }) },
                    timestamp: new Date(),
                    color: client.random(),
                    author: { name: `${message.author.username}, ${member.username} adlı kullanıcıya para göndermek üzeresin.`, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                    description: `
                    Bu işlemi onaylamak için ✅ Onayla'ya tıklayın.
                    Bu işlemi iptal etmek için ❎ İptal'e tıklayın.

                    ${message.author} kullanıcısın ${member} adlı kullanıcıya göndereceği miktar:\n${codeBlock('fix', numberWithCommas(amount) + "$")}
                    `,
                })
            ],
            components: [row]
        });
        const filter = (i) => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            if (i.customId === 'confirm') {
                const receiverData = (await User.findOne({ userID: member.id })) || new User({ userID: member.id }).save();
                if (receiverData.Inventory == null) {
                    receiverData.Inventory = { Cash: 0 }
                    await receiverData.save()
                }

                if (!receiverData.Inventory) {
                    receiverData.Inventory = { Cash: 0 };
                } else if (receiverData.Inventory.Cash === undefined || receiverData.Inventory.Cash === null || receiverData.Inventory.Cash === NaN) {
                    receiverData.Inventory = { Cash: 0 };
                }

                receiverData.Inventory.Cash += Number(amount)
                receiverData.markModified('Inventory')
                data.Inventory.Cash -= Number(amount)
                data.markModified('Inventory')

                await receiverData.save()
                await data.save()
                await i.editReply({ embeds: [], content: `${client.getEmoji('check')} ${bold(message.author.username)} adlı kullanıcı ${bold(member.username)} adlı kullanıcıya ${numberWithCommas(bold(amount + "$"))} gönderdi.`, components: [] });
            } else {
                await i.editReply({ embeds: [], content: `${client.getEmoji('mark')} İşlem iptal edildi.`, components: [] });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await msg.edit({ embeds: [], content: `${client.getEmoji('mark')} İşlem iptal edildi.`, components: [] });
            }
        });
    },
};

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}