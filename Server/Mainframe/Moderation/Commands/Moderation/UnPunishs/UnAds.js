const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Punitive, User, ForceBan, Mute, VoiceMute, Jail, Ads } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'unads',
    Aliases: ['unreklam', 'reklamçıkart', 'reklamcikart'],
    Description: 'Belirlenen üyeyi cezalıdan çıkarır.',
    Usage: 'unads <@User/ID>',
    Category: 'Moderation',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.guild.settings.jailAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (message.author.id === member.id) {
            message.reply(global.cevaplar.kendi).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (!member.manageable) {
            message.reply(global.cevaplar.dokunulmaz).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (message.member.roles.highest.position <= member.roles.highest.position) {
            message.reply(global.cevaplar.yetkiust).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const adsControl = await Ads.findOne({ ID: member.id })
        if (!adsControl) {
            message.reply(global.cevaplar.cezayok).then(s => setTimeout(() => s.delete().catch(err => { }), 7500));
            return;
        }

        message.react(`${client.getEmoji("check")}`)
        message.reply({ content: `${client.getEmoji("check")} ${member} üyesinin reklam cezası ${message.author} tarafından kaldırıldı!` }).then((e) => setTimeout(() => { e.delete(); }, 50000));

        const logChannel = await client.getChannel("ads-log", message)
        if (!logChannel) return;

        logChannel.send({ content: `${member} üyesinin \`#${adsControl.No}\` numaralı cezalandırılması, ${client.timestamp(Date.now())} ${message.member} tarafından kaldırıldı.` })
        if (member) member.send({ content: `Sunucumuzda \`${message.author.username}\` tarafından **Reklam** cezanız ${client.timestamp(Date.now())} kaldırıldı.` }).catch(err => { })
            
        await Punitive.updateOne({ No: adsControl.No }, { $set: { Active: false, Expried: Date.now(), Remover: message.member.id } }, { upsert: true })
        await Ads.deleteOne({ ID: member.id })

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
            if (member && member.manageable) member.setNickname(`${member.user.globalName.includes(message.guild.settings.serverTag) ? "" : (message.guild.settings.secondTag || "")} İsim | Yaş`)
            member.setRoles(message.guild.settings.unregisterRoles)
        }
    },
};