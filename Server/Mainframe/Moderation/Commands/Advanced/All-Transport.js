const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType } = require('discord.js'); 

module.exports = {
    Name: 'alltransport',
    Aliases: ['all-transport', 'herkesitaşı', 'htaşı', 'toplutaşı', 'toplutası', 'toplutasi'],
    Description: 'Ses kanalında bulunan tüm kullanıcıları belirtilen kanala taşır',
    Usage: 'alltransport',
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
        const row = new ActionRowBuilder()
        .addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("channel-transport")
              .setPlaceholder('Bir kanal seçimi yapın!')
              .setChannelTypes(ChannelType.GuildVoice)
              .setMaxValues(1)
        ]);

        let msg = await message.channel.send({ content: `\`${channel.name}\` adlı kanalda bulunan **${channel.members.size.toString()}** adet üyenin taşınacağı kanalı seç.`, components: [row] });
        var filter = (menu) => menu.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (menu) => {
            collector.stop();
            menu.deferUpdate();
            const targetChannel = menu.values[0];
            channel.members.forEach(member => {
                if (member.voice.channel && !member.user.bot) {
                    member.voice.setChannel(targetChannel);
                }
            });
            message.react(client.getEmoji("check"));
            if (msg) msg.delete().catch(err => { });
            message.channel.send({ content: `${client.getEmoji("check")} Başarıyla kanaldaki tüm kullanıcılar <#${targetChannel}> adlı kanala taşındı.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 15000));
        });
        
        collector.on("end", async () => {
           if (msg) msg.delete().catch(err => { });
        }) 
   }, 
};