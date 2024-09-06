const { PermissionsBitField: { Flags }, ApplicationCommandOptionType } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'isim',
    Aliases: ['i', 'nick', 'isimdegistir'],
    Description: 'Belirtilen üyenin ismini ve yaşını güncellemek için kullanılır.',
    Usage: 'isim <@User/ID>',
    Category: 'Register',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.registerAuth.some(ertu => message.member.roles.cache.has(ertu)) && !message.guild.settings.ownerRoles.some(ertu => message.member.roles.cache.has(ertu)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (!message.guild.settings.registerSystem) return message.reply({ content: `${client.getEmoji("mark")} Bu sunucuda kayıt sistemi devre dışı bırakılmış.` });

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
        if (!member.manageable) return message.reply(global.cevaplar.dokunulmaz).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply(global.cevaplar.yetkiust).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })

        args = args.filter(a => a !== "" && a !== " ").splice(1);
        let name = args.filter(arg => isNaN(arg)).map(arg => arg.charAt(0).replace('i', "İ").toUpperCase() + arg.slice(1)).join(" ");
        if (!name) return message.reply(global.cevaplar.argümandoldur).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        let age = args.filter(arg => !isNaN(arg))[0] || undefined
        if (age < message.guild.settings.minAge) return message.reply({ content: `Belirtilen kullanıcının yaşı ${message.guild.settings.minAge ?? 15}'den küçük olduğu için kayıt işlemi yapılamıyor. ${client.getEmoji('mark')}` }).then(x => { setTimeout(() => { x.delete() }, 5000) })
        var setName = `${name} ${age == undefined ? "" : `| ${age}`}`;

        message.react(`${client.getEmoji("check")}`)
        member.Rename(`${setName}`, message.member, "İsim Değiştirme", message.channel)
    },
};