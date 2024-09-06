const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, bold, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'yazıtura',
    Aliases: ['yazitura', 'yt', 'yazı-tura', 'yazi-tura'],
    Description: 'Para döndürerek para katlarsınız.',
    Usage: 'yazıtura <100-50000-all>',
    Category: 'Economy',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
        if (data.Inventory == null) {
            data.Inventory = {
                Cash: 0,
            }
            await data.save()
        }
        let amount = Number(args[0])
        if (args[0] == 'all') {
            if (data.Inventory.Cash >= 500000) amount = 500000
            if (data.Inventory.Cash < 500000) amount = data.Inventory.Cash
            if (data.Inventory.Cash <= 0) amount = 10
        }

        if (isNaN(amount)) {
            message.reply({ content: 'Lütfen geçerli bir miktar giriniz.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
          }
      
          if (amount <= 0) {
            message.reply({ content: 'Belirttiğiniz miktar geçersizdir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
          } 
      
          if (amount > 500000) {
            message.reply({ content: 'Maksimum miktar 500.000$ olabilir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
          }
      
          if (amount > data.Inventory.Cash) {
            message.reply({ content: 'Yeterli paranız bulunmamaktadır.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
          }
      
          if (amount < 10) {
            message.reply({ content: 'Minimum bahis 10$ olabilir.' }).then((x) => { setTimeout(() => { x.delete().catch((err) => { }) }, 5000) })
            return;
          }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('heads')
                    .setLabel('Yazı')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('tails')
                    .setLabel('Tura')
                    .setStyle(ButtonStyle.Secondary),
            );

        const msg = await message.reply({ content: 'Yazı mı Tura mı? Seçiminizi yapın!', components: [row] });

        const filter = (i) => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            const choice = i.customId;
            const chances = ["heads", "tails"];
            const result = chances[Number(Math.floor(Math.random() * 2))];

            data.Inventory.Cash -= Number(amount)
            data.markModified('Inventory')

            if (choice === result) {
                await i.editReply({ content: `Tebrikler! ${choice === 'heads' ? 'Yazı' : 'Tura'} geldi ve ${bold(amount * 2)}$ kazandınız!`, components: [] });
                data.Inventory.Cash += Number(amount * 2)
                data.markModified('Inventory')
            } else {
                await i.editReply({ content: `Maalesef ${choice === 'heads' ? 'Yazı' : 'Tura'} gelmedi ve ${bold(amount)}$ kaybettiniz.`, components: [] });
            }
            data.save()
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                await msg.edit({ content: 'Zamanında bir seçim yapmadınız.', components: [] });
            }
        });
    },
};

