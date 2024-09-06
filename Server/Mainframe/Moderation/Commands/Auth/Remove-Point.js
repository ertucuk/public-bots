const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, inlineCode, bold, EmbedBuilder } = require('discord.js')
const { Staff } = require('../../../../Global/Settings/Schemas')
const Staffs = require('../../../../Global/Base/Staff')

module.exports = {
    Name: 'puançıkar',
    Aliases: [
        'remove-point',
        'pointremove',
        'removepoint',
        'çıkarpuan',
        'removepoints',
        'pointsremove',
        'çıkartpoint',
        'pointçıkar',
        'pç'
      ],
    Description: 'Belirtilen kullanıcıya belirtilen puanı çıkarır.',
    Usage: 'puançıkar <@User/ID> <puan>',
    Category: 'Auth',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.ownerRoles.some((r) => message.member.roles.cache.has(r)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.etiketle).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        if (!(await Staffs.checkPointStaff(member))) {
            message.reply({ content: `${client.getEmoji('mark')} Belirtilen kullanıcı yetkili değil!` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 
          
        const count = parseInt(args[1])
        if (!count || 0 >= count) {
            message.reply({ content: `${client.getEmoji('mark')} Geçerli bir puan belirt!` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const document = await Staff.findOne({ id: member.id })
        if (document) {
            document.totalPoints -= count
            document.bonusPoints -= count
            document.markModified('totalPoints bonusPoints')
            await document.save()
        }

        const logChannel = await client.getChannel('staff-log', message)
        if (logChannel) {
            logChannel.send({
                content: `${message.author} (${inlineCode(message.author.id)}) adlı yetkili ${member} (${inlineCode(member.id)}) adlı yetkiliden ${bold(count.toString())} puan çıkardı.`
            })
        }

        message.channel.send(`${client.getEmoji('check')} ${member} adlı yetkiliden ${bold(count.toString())} adet puan çıkardı.`).then((e) => setTimeout(() => { e.delete(); }, 10000))
    },
}