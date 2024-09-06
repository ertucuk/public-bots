const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');
const BlackJack = require('../../../../Global/Base/Utils/Games')

module.exports = {
  Name: 'blackjack',
  Aliases: ['bj'],
  Description: 'Blackjack oynamanıza yarar.',
  Usage: 'blackjack <100-50000-all>',
  Category: 'Economy',
  Cooldown: 10,
  Command: { Prefix: true },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.coinChannels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu sadece bot-komut ve coin-chat kanallarında kullanabilirsin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    } 

    const data = (await User.findOne({ userID: message.author.id })) || new User({ userID: message.author.id }).save();
    if (data.Inventory == null) {
      data.Inventory = {
        Cash: 0,
      }
      await data.save()
    }
    let amount = args[0];
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

    data.Inventory.Cash -= Number(amount)
    data.markModified('Inventory')

    const winAmount = Number(amount * 2)
    const game = await BlackJack(message, {
      buttons: true,
      transition: 'edit',
      bahis: amount,
      odul: winAmount,
      doubleodul: Number(winAmount * 2)
    })

    let point = 0
    if (game.ycard)
      game.ycard.forEach((c) => {
        point += c.value
      })

    if (game.result.includes('DOUBLE WIN') || game.result == 'BLACKJACK') {
      data.Inventory.Cash += Number(winAmount * 2)
    } else if (
      game.result.includes('WIN') ||
      game.result == 'SPLIT LOSE-WIN' ||
      game.result == 'SPLIT WIN-LOSE' ||
      game.result == 'SPLIT LOSE-DOUBLE WIN' ||
      game.result == 'SPLIT TIE-DOUBLE WIN' ||
      game.result == 'SPLIT DOUBLE WIN-TIE' ||
      game.result == 'SPLIT DOUBLE WIN-LOSE' ||
      game.result == 'SPLIT WIN-TIE' ||
      game.result == 'SPLIT TIE-WIN'
    ) {
      data.Inventory.Cash += Number(winAmount)
    } else if (game.result.includes('INSURANCE')) {
      data.Inventory.Cash += Number(winAmount)
    } else if (game.result.includes('TIE')) {
      data.Inventory.Cash += Number(winAmount)
    } else if (game.result == 'CANCEL' || game.result == 'TIMEOUT') {
    }

    data.markModified('Inventory')
    data.save()
  },
};