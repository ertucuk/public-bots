const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Punitive, User, ForceBan, Mute, VoiceMute, Jail } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'şüpheliçıkart',
    Aliases: ['unsuspend', 'unsuspect'],
    Description: 'Belirlenen üyeyi şüpheliden  çıkarır.',
    Usage: 'unsuspect <@User/ID>',
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
        if (Jails) {
            message.react(`${client.getEmoji("check")}`)
            message.channel.send({ content: `${client.getEmoji("mark")} Belirtilen üye cezalandırılmış olduğu için, şüpheliden çıkaramıyorum.` }).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
            return;
        };

        const Users = await User.findOne({ userID: member.id })
        if (!message.guild.settings.taggedMode && Users && Users.userName && Users.Gender) {
            if (member && member.manageable) member.setNickname(`${member.user.globalName.includes(message.guild.settings.serverTag) ? "" : (message.guild.settings.secondTag || "")} ${Users.userName}`)
            if (Users.Gender == "Male") member.setRoles(message.guild.settings.manRoles)
            if (Users.Gender == "Girl") member.setRoles(message.guild.settings.womanRoles)
            if (Users.Gender == "Unregister") member.setRoles(message.guild.settings.unregisterRoles)
            if (member.user.displayName.includes(message.guild.settings.serverTag)) member.roles.add(message.guild.settings.familyRole)
        } else {
            if (member && member.manageable) await member.setNickname(`${member.user.globalName.includes(message.guild.settings.serverTag) ? "" : (message.guild.settings.secondTag || "")} İsim | Yaş`)
            member.setRoles(message.guild.settings.unregisterRoles)
        }

        const SuspectLog = await client.getChannel("suspect-log", message)
        if (!SuspectLog) return console.log("suspect Log kanalı ayarlanmamış")
        if (SuspectLog) SuspectLog.send({ embeds: [new global.VanteEmbed().setDescription(`${member} uyesinin şüpheli durumu ${client.timestamp(Date.now())} ${message.member} tarafından kaldırıldı.`)] })
        await message.reply({ embeds: [new global.VanteEmbed().setDescription(`${client.getEmoji("check")} Başarıyla ${member} isimli üye şüpheli hesap konumundan çıkartıldı!`)] }).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (member) member.send({ content: `**${message.guild.name}** sunucusunda ${message.member} tarafından süpheli hesap konumundan çıkartıldınız.` }).catch(err => { });
    },
};