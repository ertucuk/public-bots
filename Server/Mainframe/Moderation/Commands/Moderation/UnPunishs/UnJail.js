const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Punitive, User, ForceBan, Mute, VoiceMute, Jail, Ads } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'unjail',
    Aliases: ['cezalıçıkart', 'cezalicikart'],
    Description: 'Belirlenen üyeyi cezalıdan çıkarır.',
    Usage: 'unjail <@User/ID>',
    Category: 'Moderation',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

        if (!message.guild.settings.jailAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
        if (!member.manageable) return message.reply(global.cevaplar.dokunulmaz).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply(global.cevaplar.yetkiust).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })

        const Jails = await Jail.findOne({ ID: member.id })
        if (!Jails) return message.reply(global.cevaplar.cezayok).then(s => setTimeout(() => s.delete().catch(err => { }), 7500));

        message.react(`${client.getEmoji("check")}`)
        message.reply({ content: `${client.getEmoji("check")} ${member} üyesinin jaili ${message.author} tarafından kaldırıldı!` }).then((e) => setTimeout(() => { e.delete(); }, 50000));
        const JailLog = await client.getChannel("jail-log", message)
        if (!JailLog) return console.log("Jail Log kanalı ayarlanmamış")
        if (JailLog) JailLog.send({ embeds: [new global.VanteEmbed().setDescription(`${member} üyesinin \`#${Jails.No}\` numaralı cezalandırılması, ${client.timestamp(Date.now())} ${message.member} tarafından kaldırıldı.`)] })
        if (member) member.send({ content: `**${message.guild.name}** sunucusunda  \`${message.author.username}\` tarafından \`#${Jails.No}\` numaralı **Jail** cezanız ${client.timestamp(Date.now())} kaldırıldı.` }).catch(err => { })
        await Punitive.updateOne({ No: Jails.No }, { $set: { Active: false, Expried: Date.now(), Remover: message.member.id } }, { upsert: true })
        await Jails.deleteOne({ ID: member.id })

        const Users = await User.findOne({ userID: member.id })
        if (!message.guild.settings.taggedMode && Users && Users.userName && Users.Gender) {
            if (member && member.manageable) member.setNickname(`${member.user.globalName.includes(message.guild.settings.serverTag) ? "" : (message.guild.settings.secondTag || "")} ${Users.userName}`)
            if (Users.Gender == "Male") member.setRoles(message.guild.settings.manRoles)
            if (Users.Gender == "Girl") member.setRoles(message.guild.settings.womanRoles)
            if (Users.Gender == "Unregister") member.setRoles(message.guild.settings.unregisterRoles)
            if (message.guild.settings.public) {
                if (member.user.displayName.includes(message.guild.settings.serverTag)) member.roles.add(message.guild.settings.familyRole)
            }
        } else {
            if (member && member.manageable) await member.setNickname(`${member.user.globalName.includes(message.guild.settings.serverTag) ? "" : (message.guild.settings.secondTag || "")} İsim | Yaş`)
            member.setRoles(message.guild.settings.unregisterRoles)
        }
    },
};