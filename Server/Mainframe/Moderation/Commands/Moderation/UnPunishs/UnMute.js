const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Punitive, User, ForceBan, Mute, VoiceMute } = require('../../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'unmute',
    Aliases: ['susturmakaldir', 'unvmute', 'susturmakaldır'],
    Description: 'Belirlenen üyenin metin ve ses kanallarındaki susturmasını açar',
    Usage: 'unmute <@User/ID>',
    Category: 'Moderation',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

        if (!message.guild.settings.chatMuteAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.voiceMuteAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (message.author.id === member.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })
        if (!member.manageable) return message.reply(global.cevaplar.dokunulmaz).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })
        if (message.member.roles.highest.position <= member.roles.highest.position) return message.reply(global.cevaplar.yetkiust).then(x => { setTimeout(() => { x.delete().catch(err => { }) }, 5000) })

        const PunitiveControl = await Mute.findOne({ ID: member.id }) || VoiceMute.findOne({ ID: member.id });
        if (!PunitiveControl) return message.reply(global.cevaplar.cezayok).then(s => setTimeout(() => s.delete().catch(err => { }), 7500));

        const Chat = await Punitive.findOne({ Member: member.id, Active: true, Type: "Metin Susturulma" })
        const Voice = await Punitive.findOne({ Member: member.id, Active: true, Type: "Ses Susturulma" })

        if (!Chat && !Voice) return message.reply(global.cevaplar.cezayok).then(s => setTimeout(() => s.delete().catch(err => { }), 7500));

        const row = new ActionRowBuilder({
            components: [
                new ButtonBuilder({
                    customId: "mute",
                    style: Chat ? ButtonStyle.Success : ButtonStyle.Secondary,
                    emoji: "848035393471381504",
                    disabled: !message.guild.settings.chatMuteRole.split(',').some(x => member.roles.cache.has(x))
                }),

                new ButtonBuilder({
                    customId: "vmute",
                    style: Voice ? ButtonStyle.Success : ButtonStyle.Secondary,
                    emoji: "848034896948494367",
                    disabled: !message.guild.settings.voiceMuteRole.split(',').some(x => member.roles.cache.has(x))
                }),

                new ButtonBuilder({
                    customId: "cancel",
                    style: ButtonStyle.Danger,
                    emoji: `1099793976644599959`
                })
            ]
        });

        let description = ``
        if (Chat) description = `metin kanallarında **\`#${Chat.No}\`** ceza numaralı susturulmasını`
        if (Voice) description = `ses kanallarında ki **\`#${Voice.No}\`** ceza numaralı susturulmasını`
        if (Chat && Voice) description = `**\`#${Chat.No}\`**, **\`#${Voice.No}\`** ceza numaralarına sahip metin ve ses susturulmasını`

        const Embed = new global.VanteEmbed()
            .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setThumbnail(message.guild.iconURL({ dynamic: true, size: 2048 }))
            .setDescription(`**Merhaba!** ${message.author}, ${member} üyesinin ${description} kaldırmak için aşağıdaki butonları kullanabilirsiniz.`)

        let msg = await message.reply({ embeds: [Embed], components: [row] })
        const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 60000 })

        collector.on('collect', async i => {
            if (i.customId === "mute") {
                i.deferUpdate();

                member.roles.remove(message.guild.settings.chatMuteRole)
                await Punitive.updateOne({ No: Chat.No }, { $set: { Active: false, Expried: Date.now(), Remover: message.member.id } }, { upsert: true })
                if (await Mute.findOne({ ID: member.id })) {
                    await Mute.findOneAndDelete({ ID: member.id })
                }

                const MuteLog = await client.getChannel("mute-log", message)
                if (MuteLog) MuteLog.send({ embeds: [new global.VanteEmbed().setDescription(`${member} uyesinin \`#${Chat.No}\` numaralı susturulması, ${client.timestamp(Date.now())} ${message.member} tarafından kaldırıldı.`)] })
                if (member) member.send({ content: `**${message.guild.name}** sunucusunda  \`${message.author.username}\` tarafından **\`#${Chat.No}\`** numaralı metin kanallarında susturulma cezanız ${client.timestamp(Date.now())} kaldırıldı.` }).catch(err => { })

                await msg.edit({ embeds: [new global.VanteEmbed().setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }).setDescription(`${member} üyesinin metin kanallarında ki **\`#${Chat.No}\`** ceza numaralı susturulması ${message.member} tarafından kaldırıldı.`)], components: [] })
            }

            if (i.customId === "vmute") {
                i.deferUpdate();

                member.roles.remove(message.guild.settings.voiceMuteRole);
                if (member && member.voice.channel) member.voice.setMute(false)
                await Punitive.updateOne({ No: Voice.No }, { $set: { Active: false, Expried: Date.now(), Remover: message.member.id } }, { upsert: true })
                if (await VoiceMute.findOne({ ID: member.id })) {
                    await VoiceMute.findOneAndDelete({ ID: member.id })
                }

                const MuteLog = await client.getChannel("vmute-log", message)
                if (MuteLog) MuteLog.send({ embeds: [new global.VanteEmbed().setDescription(`${member} uyesinin \`#${Voice.No}\` numaralı ses susturulması, ${client.timestamp(Date.now())} ${message.member} tarafından kaldırıldı.`)] })
                if (member) member.send({ content: `**${message.guild.name}** sunucusunda  \`${message.author.username}\` tarafından **\`#${Voice.No}\`** numaralı ses kanallarında susturulma cezanız ${client.timestamp(Date.now())} kaldırıldı.` }).catch(err => { })

                await msg.edit({ embeds: [new global.VanteEmbed().setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }).setDescription(`${member} üyesinin ses kanallarında ki **\`#${Voice.No}\`** ceza numaralı susturulması ${message.member} tarafından kaldırıldı.`)], components: [] })
            }

            if (i.customId === "cancel") {
                i.deferUpdate().catch(err => { })
                return msg.delete().catch(err => { })
            }
        })
    },
};