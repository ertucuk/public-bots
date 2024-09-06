const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'yasaklıtag',
    Aliases: ['yasaklı-tag', 'bannedtag', 'banned-tag'],
    Description: 'Yasaklı tag kontrol',
    Usage: 'yasaklıtag',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        if (message.guild.settings?.bannedTags.length === 0) return message.channel.send({ content: 'Sunucunuzda yasaklı tag bulunmamaktadır.' });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('bannedtag-control')
                    .setPlaceholder('Yasaklı Tag Kontrolü')
                    .addOptions([
                        { label: 'Yasaklı Tag Kontrol', value: 'bannedtagControl', description: 'Yasaklı tagta olan üyelere yasaklı tag rolü verirsiniz.' },
                        { label: 'Yasaklı Tagları Listele', value: 'bannedtaglist', description: 'Sunucunuzda yasaklı tagları listeler.' },
                        { label: 'Yasaklı Tag Çıkar', value: 'bannedtagRemove', description: 'Yasaklı tagları kontrol edip, istediğiniz tagı yasaklı tag kontrolünden çıkarabilirsiniz.' }
                    ])
            )

        const msg = await message.channel.send({ content: 'Aşağıdaki menüden yasaklı tagları kontrol edip, istediğiniz tagı yasaklı tag kontrolünden çıkarabilirsiniz.', components: [row] });
        var filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            i.deferUpdate();
            if (i.values[0] === 'bannedtagControl') {
                for (const tag of message.guild.settings.bannedTags) {
                    const members = message.guild.members.cache.filter(m => m.user.displayName.includes(tag) && !m.roles.cache.has(message.guild.settings.bannedTagRole)).map(x => x.id);
                    const members2 = message.guild.members.cache.filter(m => !m.user.displayName.includes(tag) && m.roles.cache.has(message.guild.settings.bannedTagRole)).map(x => x.id);

                    if (members.length === 0 && members2.length === 0) return;

                    const msg2 = await msg.reply({ content: `**${tag}** tagındaki üyelerin rolleri güncelleniyor...` });

                    await Promise.all(members.map(async (x, i) => {
                        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
                        const member = message.guild.members.cache.get(x);
                        if (!member) return;
                        member.send({ content: `**Merhaba** ${member}\n\nBu yazı, sunucumuz içerisindeki kurallarımıza uymadığı tespit edilen bir sembolün, sizin hesabınızda tespit edildiğini bildirmek amacıyla yazılmıştır. Üzerinizde bulunan (\`${message.guild.settings.bannedTags.find(x => member.user.displayName.includes(x))}\`) sembolü sunucumuz kurallarına aykırı olduğu için hesabınız yasaklı kategorisine eklenmiştir.\n\nBu durumun düzeltilmesi için, yasaklı sembolü kaldırmanız gerekmektedir. Söz konusu yasaklı sembol hesabınızdan çıkarıldığında, eğer daha önce kayıtlıysanız otomatik olarak kayıtlı duruma geçeceksiniz. Ancak, eğer kayıtlı değilseniz, tekrar kayıtsıza düşeceksiniz.\n\nHerhangi bir sorunuz veya açıklamanız için moderatör ekibimizle iletişime geçebilirsiniz.\n\nSaygılarımla,\n**${member.guild.name} Moderasyon Ekibi**` }).catch()
                        if (member.roles.cache.has(message.guild.roles.premiumSubscriberRole.id)) {
                            await member.setRoles([message.guild.roles.premiumSubscriberRole.id, message.guild.settings.bannedTagRole]);
                        } else {
                            await member.setRoles(message.guild.settings.bannedTagRole);
                        }
                    }));

                    await Promise.all(members2.map(async (x, i) => {
                        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
                        const member = message.guild.members.cache.get(x);
                        if (!member) return;
                        member.send({ content: `**${member.guild.name}** sunucumuzun yasaklı taglarından birine sahip olduğun için cezalıydın. Ancak, şimdi bu yasaklı tagı çıkardığın için cezalıdan çıkarıldın!` }).catch();
                        await member.setRoles(message.guild.settings.unregisterRoles);
                    }));

                    return msg2.edit({ content: `${tag} tagındaki ${members.length} üyeye başarıyla yasaklı tag rolü verildi.` });
                }
            } else if (i.values[0] === 'bannedtaglist') {

                const embed = new EmbedBuilder({
                    color: client.random(),
                    title: 'Yasaklı Taglar',
                    description: message.guild.settings.bannedTags.map((tag) => `**${tag}** -> ${getMemberCountWithTag(message, tag)} üye`).join('\n'),
                })

                await msg.edit({ content: 'Sunucunuzda yasaklı taglar aşağıda listelenmiştir.', embeds: [embed] });
            } else if (i.values[0] === 'bannedtagRemove') {

                const remove = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('bannedtag-remove')
                            .setPlaceholder('Yasaklı Tag Seç')
                            .addOptions(message.guild.settings.bannedTags.map(tag => { return { label: tag, value: tag, description: 'Çıkarmak için tıkla!' } }))
                    )

                const msg2 = await msg.edit({ content: 'Yasaklı tagları kontrol edip, çıkarmak istediğiniz tagı seçiniz.', components: [remove] });
                var filter2 = i => i.user.id === message.author.id;
                const collector2 = msg2.createMessageComponentCollector({ filter2, time: 30000 });

                collector2.on('collect', async i => {
                    if (i.customId === 'bannedtag-remove') {
                        const tag = i.values[0];

                        const members = message.guild.members.cache.filter(m => m.user.displayName.includes(tag) && m.roles.cache.has(message.guild.settings.bannedTagRole)).map(x => x.id);
                        const msg3 = await msg2.edit({ content: `**${tag}** tagında ${members ? members.length : 0} üye bulundu ve ${members.length > 0 ? `yasaklı tag başarıyla kaldırılıp, üyelere rol verilmeye başlandı.` : 'yasaklı tag başarıyla kaldırıldı.'}`, components: [] });

                        try {
                            message.guild.settings.bannedTags = message.guild.settings.bannedTags.filter(x => !x.includes(tag));
                            await message.guild.settings.save();
                        } catch (e) {
                            console.log(e);
                            return;
                        }

                        if (members.length === 0) return;
                        await Promise.all(members.map(async (x, i) => {
                            await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
                            const member = message.guild.members.cache.get(x);
                            if (!member) return;
                            const UserData = await User.findOne({ userID: x });
                            member.send({ content: `**${member.guild.name}** sunucumuzun yasaklı taglarından birine sahip olduğun için cezalıydın. Ancak, şimdi bu yasaklı tagı çıkardığın için cezalıdan çıkarıldın!` }).catch();
                            if (!message.guild.settings.taggedMode && UserData && UserData.userName && UserData.Names && UserData.Gender) {
                                if (message.guild.settings.public) {
                                    member.setNickname(`${member.user.displayName.includes(message.guild.settings.serverTag) ? `${message.guild.settings.serverTag}` : (message.guild.settings.secondTag || "")} ${UserData.userName}`)
                                } else {
                                    member.setNickname(`${message.guild.settings.secondTag} ${UserData.userName}`).catch(err => console.log(global.cevaplar.isimapi));
                                }
                                if (UserData.Gender == "Male") await member.setRoles(message.guild.settings.manRoles).catch();
                                if (UserData.Gender == "Girl") await member.setRoles(message.guild.settings.womanRoles).catch();
                                if (UserData.Gender == "Unregister") await member.setRoles(message.guild.settings.unregisterRoles).catch();
                            } else {
                                member.setRoles(message.guild.settings.unregisterRoles).catch();
                                if (member && member.manageable) await member.setNickname(`${member.user.displayName.includes(message.guild.settings.serverTag) ? `${message.guild.settings.serverTag}` : (message.guild.settings.secondTag || "")} İsim | Yaş`)
                            }
                        }));

                        await msg3.edit({ content: `**${tag}** tagı başarıyla kaldırıldı ve üyelere gerekli düzenlemeler yapıldı.`, components: [] });
                    }
                });
            }
        });

        collector.on('end', async () => {
            if (message) message.delete().catch();
            if (msg) msg.delete().catch();
        })
    },
};

function getMemberCountWithTag(message, tag) {
    let memberCount = 0;
    message.guild.members.cache.forEach(member => {
        if (member.user.displayName.includes(tag)) {
            memberCount++;
        }
    });
    return memberCount;
}