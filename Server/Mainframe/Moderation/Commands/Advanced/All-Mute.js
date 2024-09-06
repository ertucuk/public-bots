const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 

module.exports = {
    Name: 'allmute',
    Aliases: ['herkesisustur', 'muteall'],
    Description: 'Kanaldaki tüm kullanıcıları susturur.',
    Usage: 'allmute',
    Category: 'Staff',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000))
            return;
        } 

        if (!message.member.voice.channel) {
            message.reply({ content: `${client.getEmoji("mark")} Bir ses kanalında olmanız gerekiyor.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 

        const channel = message.member.voice.channel;
        if (channel.members.size <= 3) {
            message.reply({ content: `${client.getEmoji("mark")} Kanalda bulunan kullanıcı sayısı 3'ten az olduğu için işlem iptal edildi.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('allmute')
                    .setLabel('Herkesi Sustur')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('allunmute')
                    .setLabel('Susturmayı Kaldır')
                    .setStyle(ButtonStyle.Success),
            );

        let msg = await message.channel.send({ content: `\`${message.member.voice.channel.name}\` adlı kanalda yapmak istediğiniz işlemi seçin.`, components: [row] });
        var filter = (menu) => menu.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (menu) => {
            collector.stop();
            menu.deferUpdate();
            if (menu.customId === "allmute") {
                channel.members.forEach(member => {
                    if (member.voice.channel && !member.user.bot && member.id !== message.author.id && !member.permissions.has(Flags.Administrator)) {
                        member.voice.setMute(true);
                    }
                });
                message.react(client.getEmoji("check"));
                message.channel.send({ content: `${client.getEmoji("check")} Başarıyla kanaldaki tüm kullanıcılar susturuldu.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 15000));
            } else if (menu.customId === "allunmute") {
                channel.members.forEach(member => {
                    if (member.voice.channel) {
                        member.voice.setMute(false);
                    }
                });
                message.react(client.getEmoji("check"));
                message.channel.send({ content: `${client.getEmoji("check")} Başarıyla kanaldaki tüm kullanıcıların susturması kaldırıldı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 15000));
            }
        });

        collector.on("end", async () => {
            msg.delete().catch(err => { });
        })
   }, 
};