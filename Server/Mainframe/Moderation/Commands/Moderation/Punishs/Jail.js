const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { Punitive, Mute, VoiceMute } = require('../../../../../Global/Settings/Schemas');
const getLimitMute = new Map()

module.exports = {
    Name: 'jail',
    Aliases: ['cezalı', 'cezali', 'cezalandır', 'karantina'],
    Description: 'Belirlenen üyeyi karantinaya gönderir.',
    Usage: 'jail <@User/ID>',
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

        if (member.roles.cache.has(message.guild.settings.quarantineRole)) {
            message.reply(global.cevaplar.cezavar).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        if (getLimitMute.get(message.author.id) >= message.guild.settings.jailLimit) {
            message.reply(global.cevaplar.limit).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const Punitives = [
            { label: "Sunucuyu kötülemek", description: "1 Gün", emoji: { id: "1265260101284003874" }, value: "1", time: "1d" },
            { label: "Kayıt odalarını trollemek", description: "1 Gün", emoji: { id: "1265260101284003874" }, value: "2", time: "1d" },
            { label: "Muteliyken yayın veya kamera açıp kışkırtıcı hareketler sergilemek", description: "1 Gün", emoji: { id: "1265260101284003874" }, value: "3", time: "1d" },
            { label: "Sorun çözme kanallarında yetkiliye hakaret etmek", description: "1 Gün", emoji: { id: "1265260101284003874" }, value: "4", time: "1d" },
            { label: "Secret odalara izinsiz girmek", description: "1 Gün", emoji: { id: "1265260101284003874" }, value: "5", time: "1d" },
            { label: "Uyarıya rağmen 3'ten fazla oda takibi yapmak", description: "1 Gün", emoji: { id: "1265260101284003874" }, value: "6", time: "1d" },
            { label: "Troll yapmak", description: "3 Gün", emoji: { id: "1265260101284003874" }, value: "7", time: "1d" },
            { label: "Dini ve Milli Değerlere Küfür", description: "3 Gün", emoji: { id: "1265260101284003874" }, value: "8", time: "3d" },
            { label: "Terör propagandası yapmak", description: "7 Gün", emoji: { id: "1265260101284003874" }, value: "9", time: "7d" },
            { label: "Israrla cinsel muhabbetler kurmaya çalışmak ve taciz", description: "7 Gün", emoji: { id: "1265260101284003874" }, value: "10", time: "7d" },
            { label: "Uygunsuz profil fotoğrafları kullanmak", description: "7 Gün", emoji: { id: "1265260101284003874" }, value: "11", time: "7d" },
        ]

        const PunitiveMenu = new ActionRowBuilder().setComponents(
            new StringSelectMenuBuilder()
                .setCustomId("cezalar3")
                .setPlaceholder("Jail cezaları")
                .setOptions(Punitives)
        );

        const msg = await message.channel.send({
            components: [PunitiveMenu],
            embeds: [
                new EmbedBuilder({
                    color: client.random(),
                    author: { name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) },
                    description: `Aşağıda bulunan menüden cezalıya atmak istediğiniz ${member} için uygun olan ceza sebebini ve süresini seçiniz!`
                })
            ]
        })

        const collector = msg.createMessageComponentCollector({ filter: (menu) => menu.user.id === message.member.id, time: 60000 });
        collector.on("collect", async (menu) => {
            for (let i = 0; i < Punitives.length; i++) {
                const Penal = Punitives[i];
                if (Penal.value === menu.values[0]) {
                    if (Number(message.guild.settings.jailLimit)) {
                        if (!message.member.permissions.has(Flags.Administrator) && !message.guild.settings.ownerRoles.some(ertumharikasinbe => message.member.roles.cache.has(ertumharikasinbe))) {
                            getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) + 1)
                            setTimeout(() => {
                                getLimitMute.set(`${message.member.id}`, (Number(getLimitMute.get(`${message.member.id}`) || 0)) - 1)
                            }, 1000 * 60 * 5)
                        }
                    }

                    const chatMute = await Mute.findOne({ ID: member.id });
                    const voiceMute = await VoiceMute.findOne({ ID: member.id });
                    if (chatMute) await Mute.deleteOne({ ID: member.id });
                    if (voiceMute) await VoiceMute.deleteOne({ ID: member.id });

                    message.react(`${client.getEmoji("check")}`)
                    await Punitive.updateMany({ Member: member.id, Active: true }, { $set: { Active: false, Remover: message.author.id, Expried: Date.now() } });
                    await member.Punitive(message.member, "JAIL", Penal.label, message.channel, Penal.time, msg);
                }
            }
        })
    },
};