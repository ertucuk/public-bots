const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'fastlogin',
    Aliases: ['hızlıgiriş', 'hizligiris', 'hızlıgiris'],
    Description: 'Hızlı Giriş',
    Usage: 'fastlogin',
    Category: 'Root',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('fastlogin')
                    .setLabel('Doğrula')
                    .setStyle(ButtonStyle.Success)
            )

        message.channel.send({
            content: `
**Merhaba Kullanıcı;**

Sunucumuz şuan çok hızlı giriş işlemi yapıldığı için rol dağıtımı durduruldu. Aşağıdaki butona tıklayarak bot hesap olmadığını doğrulayıp sunucuda gerekli rollerini alabilirsin. Eğer yanlış bir durum olduğunu düşünüyorsan sağ taraftaki yetkililere yazmaktan çekinme!
            
**${message.guild.name}**
    `, components: [row]
        });

    },
};