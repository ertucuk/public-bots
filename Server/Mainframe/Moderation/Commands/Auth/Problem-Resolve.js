const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, bold, inlineCode, Colors, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Staff, User } = require('../../../../Global/Settings/Schemas')
const Staffs = require('../../../../Global/Base/Staff')

const ONE_HOUR = 1000 * 60 * 60;
const cooldowns = new Collection();

setInterval(() => {
    const now = Date.now();
    cooldowns.sweep((v) => 0 > v - now);
}, 1000 * 60);


module.exports = {
    Name: 'sorunçöz',
    Aliases: ['sç', 'soruncoz', 'sorunçözücü', 'soruncöz'],
    Description: 'Kullanıcıların sorunlarını çözer.',
    Usage: 'sorunçöz <@User/ID>',
    Category: 'Auth',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.guild.settings.solvingAuth.some((r) => message.member.roles.cache.has(r)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return; 
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if ((await Staffs.checkStaff(member))) {
            message.reply({ content: `${client.getEmoji('mark')} Bu işlem yetkililere uygulanamaz.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const now = Date.now();
        const cooldown = cooldowns.get(member.id);
        if (cooldown && cooldown > now) {
            message.reply({ content: `${client.getEmoji('mark')} Bu kullanıcıya tekrar sorun çözme işlemi yapabilmek için **${client.timestamp(cooldown, 'f')}** beklemelisin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const reason = args.slice(1).join(' ');
        if (!reason) return message.reply({ content: `${client.getEmoji('mark')} Bir sebep belirtmelisin.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('accept').setLabel('Onaylıyorum').setStyle(ButtonStyle.Success).setEmoji('1054856853814788216'),
                new ButtonBuilder().setCustomId('cancel').setLabel('Onaylamıyorum').setStyle(ButtonStyle.Danger).setEmoji('1057679211021746186')
            );

        const msg = await message.reply({
            content: member.toString(),
            embeds: [new EmbedBuilder().setDescription(`${message.author} adlı yetkilinin sorununu çözdüğünü onaylıyor musun? İşlem 30 saniye sonra iptal edilecektir.`)],
            components: [row],
        });

        const filter = (i) => i.user.id === member.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (i) => {
            i.deferUpdate();
            if (i.customId === 'accept') {

                const document = await Staff.findOne({ id: message.member.id });
                if (!document) return message.reply({ content: `${client.getEmoji('mark')} Yetkili veritabanında bulunamadı.` });

                if (message.guild.settings.maxStaffs.some(x => message.member.roles.cache.has(x))) {
                    await Staffs.checkTasks({
                        document,
                        count: 1,
                        spesificType: 'SOLVER',
                    });
                    await Staffs.checkRole(message.member, document, 'rank');
                } else {
                    await Staffs.addPoint(message.member, 'responsibility');
                    await Staffs.checkRole(message.member, document, 'point');
                }
                await document.save();

                const userDocument = await User.findOne({ userID: message.member.id });
                userDocument?.Solvers?.push({ id: member.id, reason, timestamp: now });
                await userDocument.save();

                message.react(`${client.getEmoji('check')}`);
                msg.delete();
                message.channel.send({
                    embeds: [
                        new EmbedBuilder({
                            color: client.random(),
                            description: `${member} adlı kullanıcının sorununu çözdüğün için teşekkür ederiz.`,
                        }),
                    ],
                });

                const logChannel = await client.getChannel('solver-log', message)

                if (logChannel) {
                    logChannel.send({
                        embeds: [
                            new EmbedBuilder({
                                color: Colors.Green,
                                timestamp: now,
                                description: `${message.member} (${inlineCode(member.id)}) adlı yetkili ${member} (${inlineCode(
                                    member.id,
                                )}) adlı kullanıcının ${bold(reason)} adlı sorununu çözdü`,
                            }),
                        ],
                    });
                }

                cooldowns.set(member.id, now + ONE_HOUR);
            } else if (i.customId === 'cancel') {
                message.react(`${client.getEmoji('mark')}`);
                message.reply({ content: `${client.getEmoji('mark')} ${member} adlı kullanıcının sorununu çözme işlemi iptal edildi.` });
                collector.stop();
            }
        })
    },
};