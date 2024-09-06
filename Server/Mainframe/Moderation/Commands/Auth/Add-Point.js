const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, inlineCode, bold, EmbedBuilder } = require('discord.js')
const { Staff } = require('../../../../Global/Settings/Schemas')
const Staffs = require('../../../../Global/Base/Staff')

module.exports = {
    Name: 'puanekle',
    Aliases: ['add-point', 'pointadd', 'addpoint', 'eklepuan', 'addpoints', 'pointsadd', 'eklepoint', 'pointekle', 'pe'],
    Description: 'Belirtilen kullanıcıya belirtilen puanı ekler.',
    Usage: 'puanekle <@User/ID> <puan>',
    Category: 'Auth',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.ownerRoles.some((r) => message.member.roles.cache.has(r)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komudu sadece üst yetkililer kullanabilir.` }).then((s) => setTimeout(() => s.delete().catch((err) => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((s) => setTimeout(() => s.delete().catch((err) => { }), 5000));
            return;
        }

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then((s) => setTimeout(() => s.delete().catch((err) => { }), 5000));
            return;
        } 

        if (member.user.bot) return 
        if (!(await Staffs.checkPointStaff(member))) {
            message.reply({ content: `${client.getEmoji('mark')} Belirtilen kullanıcı yetkili değil!` })
            return
        }
          
        const count = parseInt(args[1])
        if (!count || 0 >= count) {
            message.reply({ content: `${client.getEmoji('mark')} Geçerli bir puan belirt!` })
            return
        }

        const document = await Staff.findOne({ id: member.id })
        if (document) {
            document.totalPoints += count
            document.bonusPoints += count
            document.markModified('totalPoints bonusPoints')
            await document.save()
        }

        const logChannel = await client.getChannel('staff-log', message)
        if (logChannel) {
            logChannel.send({
                content: `${message.author} (${inlineCode(message.author.id)}) adlı yetkili ${member} (${inlineCode(member.id)}) adlı yetkiliye ${bold(count.toString())} puan ekledi.`
            })
        }

        message.channel.send(`${client.getEmoji('check')} ${member} adlı yetkiliye ${bold(count.toString())} adet puan eklendi.`).then((s) => setTimeout(() => s.delete().catch((err) => { }), 5000))      
    },
}