const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { Servers } = require('../../../../../Global/Settings/Schemas')

module.exports = {
    Name: 'sorumlulukpanel',
    Aliases: ['sorumluluksetup'],
    Description: 'Sorumluluk Kurulumu',
    Usage: 'sorumlulukpanel',
    Category: 'Root',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setPlaceholder("Sorumluluk Rollerini Güncellemek İçin Tıkla!")
                .setCustomId("respons-setup")
                .addOptions([
                    { label: "Ayarları Görüntüle", value: "respons-settings", description: "Sorumluluk ayarlarını görüntüleyebilirsiniz.", emoji: { id: "1265261055748079696" } },
                    { label: "Lider Rolleri", value: "leaderRoles", description: "Sunucudaki Lider rollerini ayarlayabilirsiniz.", emoji: message.guild.settings.leaderRoles && message.guild.settings.leaderRoles.length > 0 ? "✅" : "❌" },
                    { label: "Streamer Sorumlusu", value: "streamerResponsible", description: "Sunucudaki Streamer Sorumlusunu ayarlayabilirsiniz.", emoji: message.guild.settings.streamerResponsible.trim() !== "" ? "✅" : "❌" },
                    { label: "Register Sorumlusu", value: "registerResponsible", description: "Sunucudaki Register Sorumlusunu ayarlayabilirsiniz.", emoji: message.guild.settings.registerResponsible.trim() !== "" ? "✅" : "❌" },
                    { label: "Yetkili Sorumlusu", value: "authResponsible", description: "Sunucudaki Yetkili Sorumlusunu ayarlayabilirsiniz.", emoji: message.guild.settings.authResponsible.trim() !== "" ? "✅" : "❌" },
                    { label: "Return Sorumlusu", value: "returnResponsible", description: "Sunucudaki Return Sorumlusunu ayarlayabilirsiniz.", emoji: message.guild.settings.returnResponsible.trim() !== "" ? "✅" : "❌" },

                    { label: 'Streamer Denetleyicisi', value: "streamerController", description: "Sunucudaki Streamer Denetleyicsini ayarlayabilirsiniz.", emoji: message.guild.settings.streamerController.trim() !== "" ? "✅" : "❌" },
                    { label: 'Register Denetleyicisi', value: "registerController", description: "Sunucudaki Register Denetleyicisini ayarlayabilirsiniz.", emoji: message.guild.settings.registerController.trim() !== "" ? "✅" : "❌" },
                    { label: 'Yetkili Denetleyicisi', value: "authController", description: "Sunucudaki Yetkili Denetleyicisini ayarlayabilirsiniz.", emoji: message.guild.settings.authController.trim() !== "" ? "✅" : "❌" },
                    { label: 'Return Denetleyicisi', value: "returnController", description: "Sunucudaki Return Denetleyicisini ayarlayabilirsiniz.", emoji: message.guild.settings.returnController.trim() !== "" ? "✅" : "❌" },

                    { label: 'Streamer Lideri', value: "streamerLeader", description: "Sunucudaki Streamer Liderini ayarlayabilirsiniz.", emoji: message.guild.settings.streamerLeader.trim() !== "" ? "✅" : "❌" },
                    { label: 'Yetkili Lideri', value: "authLeader", description: "Sunucudaki Yetkili Liderini ayarlayabilirsiniz.", emoji: message.guild.settings.authLeader.trim() !== "" ? "✅" : "❌" },
                ]));


        message.channel.send({ content: `Merhaba ${message.author}, sorumluluk kurulumu için aşağıdaki menüleri kullanabilirsiniz.`, components: [row] })
    },
};