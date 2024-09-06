const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { Servers } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'özelkomut',
    Aliases: ['özel-komut'],
    Description: 'Özel komut oluşturur.',
    Usage: 'özelkomut',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
        if (!['ekle', 'çıkar', 'liste'].some(x => args[0] == x)) return message.reply({ content: `Lütfen geçerli bir işlem belirtin. \`ekle\`, \`çıkar\`, \`liste\` ` })

        if (args[0] === 'ekle') {
            const special = await Servers.findOne({ serverID: message.guild.id });
            const data = special ? special.perms : [];
            let msg = await message.channel.send({ content: `Eklemek istediğin komutun adını yazman yeterlidir. (İşlem 15 saniye sonra iptal edilecektir.)` })
            let push = {}
            const filter = i => i.author.id == message.member.id
            await message.channel.awaitMessages({ filter: filter, max: 1, time: 15000, errors: ["time"] })
                .then(async isim => {
                    if (isim.first().content == ("iptal" || "i")) {
                        isim.first().delete();
                        msg.delete();
                        return;
                    };
                    if (isim.first().content.includes(" ")) {
                        msg.delete();
                        isim.first().content;
                        return message.channel.send({ content: `Komut ismi boşluk içeremez.` });
                    }
                    if (data.find(veri => veri.permName === isim.first().content)) return message.reply({ content: `Bu komut daha önce zaten eklenmiş` })
                    if (isim.first().content.length > 20) return message.channel.send({ content: `Komut ismi 20 karakterden uzun olamaz.` });
                    push.permName = isim.first().content
                    isim.first().delete();
                    await msg.edit({ content: 'Komutu kullanma izni verilcek rolleri aşağıda ki menüden seçiniz.', components: [new ActionRowBuilder().setComponents(new RoleSelectMenuBuilder().setCustomId("permRoleSelectMenu").setMaxValues(10))] });
                })

            const filter2 = i => i.user.id == message.member.id
            const collector = msg.createMessageComponentCollector({ filter: filter2, errors: ["time"], time: 35000 })
            collector.on("collect", async i => {
                await i.deferUpdate()
                if (i.customId == "permRoleSelectMenu") {

                    var role = []
                    for (let index = 0; index < i.values.length; index++) {
                        let ids = i.values[index]
                        role.push(ids)
                    }

                    push.permRoles = role
                    msg.delete()
                    let msg2 = await message.channel.send({ content: `Verilecek rolü seçiniz.`, components: [new ActionRowBuilder().setComponents(new RoleSelectMenuBuilder().setCustomId("permRolesSelectMenu").setMaxValues(5))] })
                    const filter3 = i => i.user.id == message.member.id
                    const collector2 = msg2.createMessageComponentCollector({ filter: filter3, errors: ["time"], time: 35000 })

                    collector2.on("collect", async i => {
                        await i.deferUpdate()
                        if (i.customId == "permRolesSelectMenu") {

                            var role2 = []
                            for (let index = 0; index < i.values.length; index++) {
                                let ids = i.values[index]
                                role2.push(ids)
                            }

                            push.permRoles2 = role2
                            msg2.delete()
                            await Servers.findOneAndUpdate({ serverID: message.guild.id }, { $push: { perms: push } }, { upsert: true })
                            return message.channel.send({
                                embeds: [
                                    new EmbedBuilder({
                                        color: client.random(),
                                        description: `Özel komut başarıyla eklendi.\n\nKomut Adı: ${push.permName}\nY. Rolü: ${push.permRoles.map(x => `<@&${x}>`).join(", ")}\nRol: ${push.permRoles2.map(x => `<@&${x}>`).join(", ")}`
                                    })
                                ]
                            })
                        }
                    })

                }
            })
        }

        if (args[0] === 'liste') {
            const special = await Servers.findOne({ serverID: message.guild.id });
            const data = special ? special.perms : [];
            if (data.length < 1) return message.channel.send({ content: `Bu sunucuda hiç özel komut bulunmuyor.` })
            let array = []
            data.forEach((data) => {
                array.push(`Komut Adı: ${data.permName}\n Y. Rolü: ${data.permRoles.map(x => `<@&${x}>`).join(", ")}\n Rol: ${data.permRoles2.map(x => `<@&${x}>`).join(", ")}\n------------------`)
            })
            const totalData = Math.ceil(array.length / 10)
            let page = 1
            const embed = new global.VanteEmbed().setTitle(`Özel Komut Listesi`).setDescription(array.slice((page - 1) * 10, page * 10).join('\n'))
            let msg = await message.channel.send({ embeds: [embed], components: array.length >= 10 ? [client.getButton(page, totalData)] : [] });
            const collector = msg.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== message.author.id) return;

                await i.deferUpdate();
                if (i.customId === 'first') page = 1;
                if (i.customId === 'previous') page -= 1;
                if (i.customId === 'next') page += 1;
                if (i.customId === 'last') page = totalData;

                embed.setTitle(`Özel Komut Listesi`).setDescription(array.slice((page - 1) * 10, page * 10).join('\n'))
                await msg.edit({ embeds: [embed], components: [client.getButton(page, totalData)] });
            });

            collector.on('end', collected => msg.edit({ components: [] }));
        }

        if (args[0] === 'çıkar' || args[0] === 'cıkar' || args[0] === 'cikar') {
            const special = await Servers.findOne({ serverID: message.guild.id });
            const data = special ? special.perms : [];
            let commandName = args.slice(1).join(' ');
            if (!commandName) return message.channel.send({ content: `Lütfen çıkarmak istediğiniz özel komutun adını belirtin.` });
            let foundIndex = data.findIndex(p => p.permName === commandName);
            if (foundIndex === -1) return message.channel.send({ content: `Bu isimde bir özel komut bulunamadı.` });
            data.splice(foundIndex, 1);
            await Servers.findOneAndUpdate({ serverID: message.guild.id }, { $set: { perms: data } });
            return message.channel.send({ content: `\`${commandName}\` adlı özel komut başarıyla çıkarıldı.` });
        }
    }
};