const { PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'cinsiyet',
    Aliases: ['cinsiyet'],
    Description: 'Belirtilen üye sunucuda kayıtsız bir üye ise kayıt etmek için kullanılır.',
    Usage: 'cinsiyet <@User/ID>',
    Category: 'Register',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.registerAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (!message.guild.settings.registerSystem) return message.reply({ content: `${client.getEmoji("mark")} Bu sunucuda kayıt sistemi devre dışı bırakılmış.` });

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
        if (!member.manageable) return message.reply(global.cevaplar.dokunulmaz).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply(global.cevaplar.yetkiust).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('Man').setLabel("Erkek").setStyle(ButtonStyle.Secondary).setDisabled(message.guild.settings.manRoles.some(x => member.roles.cache.has(x))),
            new ButtonBuilder().setCustomId('Woman').setLabel("Kadın").setStyle(ButtonStyle.Secondary).setDisabled(message.guild.settings.womanRoles.some(x => member.roles.cache.has(x))),
            new ButtonBuilder().setCustomId('Cancel').setLabel("İptal").setStyle(ButtonStyle.Danger),
        );

        let msg = await message.channel.send({ embeds: [new global.VanteEmbed().setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setDescription(`Üyenin cinsiyetini değiştirmek için aşağıdaki butonları kullanabilirsiniz. Yeniden ses teyidi almadan önce, lütfen üyenin cinsiyetini değiştirmek istediğinizden emin olun, çünkü ses teyiti alınırken cinsiyet bilgisi güncellenecektir.`)], components: [row] })
        const collector = msg.createMessageComponentCollector({ filter: i => i.member.id === message.author.id, time: 30000 });

        const NameData = await User.findOne({ userID: member.id })
        const Names = NameData.userName || member.displayName ? member.displayName : member.user.username;

        collector.on('collect', async i => {
            if (i.customId === "Man") {
                await i.deferUpdate();
                message.react(`${client.getEmoji("check")}`)
                await msg.edit({ embeds: [new global.VanteEmbed().setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setDescription(`${member} adlı üyenin cinsiyeti **Erkek** olarak değiştirildi.`)], components: [] }).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 15000) })
                await member.roles.remove(message.guild.settings.womanRoles).catch(err => { });
                await member.roles.add(message.guild.settings.manRoles).catch(err => { });
                await User.updateOne({ userID: member.id }, { $set: { "Gender": "Male" }, $push: { "Names": { Name: Names, Staff: message.member.id, Reason: `Cinsiyet Değiştirme`, Type: "Gender", Role: message.guild.settings.manRoles.map(x => member.guild.roles.cache.get(x)).join(","), Date: Date.now() } } }, { upsert: true })
            }

            if (i.customId === "Woman") {
                await i.deferUpdate();
                message.react(`${client.getEmoji("check")}`)
                await msg.edit({ embeds: [new global.VanteEmbed().setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setDescription(`${member} adlı üyenin cinsiyeti **Kadın** olarak değiştirildi.`)], components: [] }).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 15000) })
                await member.roles.remove(message.guild.settings.manRoles).catch(err => { });
                await member.roles.add(message.guild.settings.womanRoles).catch(err => { });
                await User.updateOne({ userID: member.id }, { $set: { "Gender": "Girl" }, $push: { "Names": { Name: Names, Staff: message.member.id, Reason: `Cinsiyet Değiştirme`, Type: "Gender", Role: message.guild.settings.womanRoles.map(x => member.guild.roles.cache.get(x)).join(","), Date: Date.now() } } }, { upsert: true })
            }

            if (i.customId === "Cancel") {
                msg.delete().catch(err => { })
                message.react(`${client.getEmoji("mark")}`)
            }
        })
    },
};