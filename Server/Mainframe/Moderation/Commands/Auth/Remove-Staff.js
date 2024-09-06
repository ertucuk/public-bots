const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, Colors, EmbedBuilder, inlineCode, bold } = require('discord.js');
const { Staff } = require('../../../../Global/Settings/Schemas')
const Staffs = require('../../../../Global/Base/Staff')

module.exports = {
    Name: 'yetkiçek',
    Aliases: ['removestaff', 'yçek', 'yç', 'yetkiçek'],
    Description: 'Belirtilen kullanıcının yetkili rollerini çeker.',
    Usage: 'yetkiçek <@User/ID> <sebep>',
    Category: 'Auth',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        if (!message.member.roles.cache.has(message.guild.settings.authLeader) && !message.member.roles.cache.has(message.guild.settings.authController) && !message.member.roles.cache.has(message.guild.settings.authResponsible) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.channel.send(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.etiketle).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (!message.guild.settings.staffs.some((x => member.roles.cache.has(x)))) {
            message.reply({ content: `${client.getEmoji('mark')} Belirtilen üye zaten yetkili değil.` })
            return;
        }

        const reason = args.slice(1).join(' ') || 'Belirtilmedi.'
        if (!reason.length) {
            message.reply({ content: `${client.getEmoji('mark')} Bir sebep belirtmelisin.` })
            return;
        } 

        const botCommandRole = message.guild.roles.cache.get(message.guild.settings.minStaffRole)
        await member.roles.remove(member.roles.cache.filter((r) => r.position >= botCommandRole.position).map((r) => r.id))

        await Staff.updateOne(
            { id: member.id },
            { $push: { oldRoles: { timestamp: Date.now(), roles: [] } }, $set: { isOldAuth: true } },
            { upsert: true }
        )

        message.channel.send({
            embeds: [
                new EmbedBuilder({
                    color: client.random(),
                    description: `${client.getEmoji('check')} ${member} adlı yetkilinin ${bold(reason)} sebebinden dolayı yetkisi çekildi.`,
                    author: { name: member.user.tag, icon: member.user.displayAvatarURL({ dynamic: true }) }
                })
            ]
        })
    },
};