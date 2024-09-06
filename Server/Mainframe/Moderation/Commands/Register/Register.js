const { PermissionsBitField: { Flags }, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Embed } = require('discord.js');
const { Punitive } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'kayıt',
    Aliases: ['k', "e", "erkek", "kadın", "kayıt", "register", "kaydet", "kayit", "kadin"],
    Description: 'Belirttiğiniz kullanıcıyı kayıt edersiniz.',
    Usage: 'kayıt <@User/ID>',
    Category: 'Register',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.registerAuth.some(ertu => message.member.roles.cache.has(ertu)) && !message.guild.settings.ownerRoles.some(ertu => message.member.roles.cache.has(ertu)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (!message.guild.settings.registerSystem) return message.reply({ content: `${client.getEmoji("mark")} Bu sunucuda kayıt sistemi devre dışı bırakılmış.` });

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
        if (!member.manageable) return message.reply(global.cevaplar.dokunulmaz).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (message.guild.settings.manRoles.some(x => member.roles.cache.has(x))) return message.reply(global.cevaplar.kayıtlı).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.guild.settings.womanRoles.some(x => member.roles.cache.has(x))) return message.reply(global.cevaplar.kayıtlı).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply(global.cevaplar.yetkiust).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (message.guild.settings.taggedMode === true && !member.user.displayName.includes(message.guild.settings.serverTag) && !member.roles.cache.has(message.guild.roles.premiumSubscriberRole) && !member.roles.cache.has(message.guild.settings.vipRole) && !message.member.permissions.has(Flags.Administrator) && !message.guild.settings.ownerRoles.some(ertu => message.member.roles.cache.has(ertu))) return message.reply(global.cevaplar.taglıalım).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })

        const punitives = await Punitive.find({ Member: member.id });
        if (punitives?.length >= 5 && !message.member.roles.cache.some(role => role.id === message.guild.settings.registerAuth && role.rawPosition <= message.guild.roles.cache.get(message.guild.settings.registerAuth).rawPosition && !message.guild.settings.some.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator))) {
            const embed = new global.VanteEmbed()
                .setAuthor({ name: member.user.username, iconURL: member.user.avatarURL({ dynamic: true }) })
                .setDescription(`${client.getEmoji("mark")} ${member} adlı kişinin kayıt işlemi, daha önce toplam **${punitives.length}** kez ceza-i işlem uygulandığı için iptal edildi. Sunucumuz, tüm faaliyetleri kayıt altına almaktadır. Sunucunun huzurunu bozan ve kurallara uymayan kullanıcılar, kayıt olamazlar.\n\nEğer bu konu hakkında şikayetiniz varsa, ${message.guild.settings.registerAuth.map(x => `<@&${x}>`)} rolüne veya üstlerine başvurabilirsiniz. İyi bir çözüm bulabilmek için işbirliği yapmaktan mutluluk duyarız.`)

            return message.reply({ embeds: [embed], content: `Kayıt duraklatıldı.` });
        }

        args = args.filter(a => a !== "" && a !== " ").splice(1);
        let name = args.filter(arg => isNaN(arg)).map(arg => arg.charAt(0).replace('i', "İ").toUpperCase() + arg.slice(1)).join(" ");
        if (!name) return message.reply(global.cevaplar.argümandoldur).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        let age = args.filter(arg => !isNaN(arg))[0] || undefined
        if (age < message.guild.settings.minAge) return message.reply({ content: `Belirtilen kullanıcının yaşı ${message.guild.settings.minAge ?? 15}'den küçük olduğu için kayıt işlemi yapılamıyor. ${client.getEmoji('mark')}` }).then(x => { setTimeout(() => { x.delete() }, 5000) })
        var setName = `${name} ${age == undefined ? "" : `| ${age}`}`;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('Man').setLabel("Erkek").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('Woman').setLabel("Kadın").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('Cancel').setLabel("İptal").setStyle(ButtonStyle.Danger),
        );

        let msg = await message.channel.send({
            components: [row],
            embeds: [
                new EmbedBuilder({
                    author: { name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                    description: `${member.toString()} (\`${setName}\`) isimli üyenin kayıt işlemini tamamlanabilmesi için lütfen aşağıda ki düğmelerden cinsiyeti seçiniz.\n\nBu kayıt işlemine \`30 Saniye\` içerisinde tepki vermezseniz, işlem otomatik olarak iptal edilir.`
                })
            ],
        })
        const collector = msg.createMessageComponentCollector({ filter: i => i.member.id === message.author.id, time: 30000 });
        
        collector.on("collect", async i => {
            if (i.customId === "Man") {
                await i.deferUpdate();
                message.react(`${client.getEmoji("check")}`)
                member.Register(`${setName}`, "Male", message.member, msg);
            }

            if (i.customId === "Woman") {
                await i.deferUpdate();
                message.react(`${client.getEmoji("check")}`)
                member.Register(`${setName}`, "Girl", message.member, msg);
            }

            if (i.customId === "Cancel") {
                await i.deferUpdate();
                if (msg) msg.delete().catch(err => { })
                message.react(`${client.getEmoji("mark")}`)
            }
        })
    },
};