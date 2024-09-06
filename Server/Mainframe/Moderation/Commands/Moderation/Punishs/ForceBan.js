const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, codeBlock } = require('discord.js');
const { Punitive, User, ForceBan, PunitiveNo } = require('../../../../../Global/Settings/Schemas');
const moment = require('moment');
moment.locale("tr")
const ms = require('ms');

module.exports = {
    Name: 'forceban',
    Aliases: ['kalkmazban', 'siktiroc', 'bb', 'oç', 'fırfır'],
    Description: 'Belirlenen üyeyi sunucudan yasaklar ve bir daha sunucuya sokturtmaz.',
    Usage: 'forceban <@User/ID>',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await client.getUser(args[0])
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (member.id == message.member.id) {
            message.reply(global.cevaplar.kendi).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.bot).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const reason = args.splice(1).join(" ") || "Sebep Belirtilmedi."

        const punitiveNo = await PunitiveNo.findOneAndUpdate({}, { $inc: { No: 1 } }, { upsert: true, new: true });
        let ceza = new Punitive({
            No: punitiveNo.No,
            Member: member.id,
            Staff: message.member.id,
            Type: "Kalkmaz Yasaklama",
            Reason: reason,
            Date: Date.now()
        }).save().catch(err => { })

        islem = new ForceBan({ No: punitiveNo.No, ID: member.id })
        await islem.save();

        const punishMessage = `# Bilgilendirilme\n→ Kullanıcı: ${member.username}\n→ Sebep: ${reason}\n→ Yetkili: ${message.member.username} (${message.member.id})\n→ Tarih: ${moment(ceza.Date).format('DD.MM.YYYY HH:mm')}`;

        const banLogChannel = await client.getChannel("ban-log", message)
        if (banLogChannel) banLogChannel.send({
            embeds: [new EmbedBuilder({
                title: `Kalkmaz Yasaklama`,
                color: client.random(),
                description: `${member} adlı üye FORCE-BAN cezası aldı. (#${ceza.No})\n${codeBlock('md', punishMessage)}`
            })]
        });
             
        message.react(`${client.getEmoji("check")}`)
        message.channel.send({ content: `${member.toString()} kullanıcısı ${message.member.toString()} tarafından ${reason} sebebiyle sunucudan kalıcı olarak yasaklandı.` }).catch(err => { })
        await message.guild.members.ban(member.id, { reason: `Yetkili: ${message.member.username} | Sebep: ${reason} | Ceza Numarası: #${ceza.No}` }).catch(err => { })
        await User.updateOne({ userID: message.member.id }, { $inc: { "Uses.Forceban": 1 } }, { upsert: true })
    },
};