const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js'); 
const { Staff, User } = require('../../../../Global/Settings/Schemas');
const Staffs = require('../../../../Global/Base/Staff')

module.exports = {
    Name: 'return',
    Aliases: [],
    Description: 'return <@User/ID>',
    Usage: 'return <@User/ID>',
    Category: 'Auth',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        } 

        if (!message.member.roles.cache.has(message.guild.settings.returnController) && !message.member.roles.cache.has(message.guild.settings.returnResponsible) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.user.bot) {
            message.reply(global.cevaplar.etiketle).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (member.id === message.author.id) {
            message.reply(global.cevaplar.kendi).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (message.guild.settings.staffs.some(x => member.roles.cache.has(x))) {
            message.reply({ content: `${client.getEmoji('mark')} Bu üye zaten yetkili.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (message.guild.settings.public) {
            if (!member.user.displayName.includes(message.guild.settings.serverTag)) {
                message.channel.send({ content: `${client.getEmoji('mark')} Belirttiğin kullanıcı sunucunun tagını almadığı için yetkiye alamazsın.` })
                return;
            }
        }

        const document = await Staff.findOne({ id: member.id });
        if (!document && !document?.oldRoles.length) {
            message.reply({ content: `${client.getEmoji('mark')} Bu üyenin eski bir yetkili kaydı bulunamadı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const oldRoles = document.oldRoles.sort((a, b) => b.timestamp - a.timestamp);
        const firstRole = oldRoles[0];

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('accept').setLabel('Onaylıyorum').setStyle(ButtonStyle.Success).setEmoji('1054856853814788216'),
                new ButtonBuilder().setCustomId('cancel').setLabel('Onaylamıyorum').setStyle(ButtonStyle.Danger).setEmoji('1057679211021746186')
            );

        const msg = await message.reply({
            content: member.toString(),
            embeds: [new global.VanteEmbed().setDescription(`${message.author} adlı üye seni geri yetkili yapmak istiyor. Onaylıyor musun?`)],
            components: [row],
        });

        const filter = (interaction) => interaction.user.id === member.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (button) => {
            if (button.customId === 'accept') {
                member.roles.add(firstRole.roles);
                document.oldRoles = document.oldRoles.filter(r => r.timestamp !== firstRole.timestamp);
                document.oldRoles.push({ timestamp: Date.now(), roles: [...firstRole.roles] });
                await document.save();

                if (msg) msg.delete().catch(err => { });
                message.channel.send({ content: `${client.getEmoji('check')} ${member} adlı üye geri yetkili yapıldı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

                const userDocument = await Staff.findOne({ id: message.author.id });
                if (message.guild.settings.maxStaffs.some(x => message.member.roles.cache.has(x)) && userDocument.tasks.some(t => t.type === 'RETURN')) {
                    await Staffs.checkTasks({
                        document: userDocument,
                        spesificType: 'RETURN',
                        count: 1,
                    });
                    await Staffs.checkRole(message.member, userDocument, 'rank');
                } else {
                    await Staffs.addPoint(message.member, 'responsibility');
                    await Staffs.checkRole(message.member, userDocument, 'point');
                }
                await document.save();

                await Staffs.checkRole(message.member, userDocument);
                await userDocument.save();

                const returnDocument = await User.findOne({ userID: message.author.id });
                returnDocument?.Returns.push({ id: member.id, timestamp: Date.now() });

            } else {
                if (msg) msg.delete().catch(err => { });
                message.channel.send({ content: `${client.getEmoji('check')} İşlem iptal edildi.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            }
        });
    },
};