const {  PermissionsBitField: { Flags }, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js'); 
const { Punitive, User, ForceBan } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'banlist',
    Aliases: ['banliste', 'yasaklamalar', 'ban-list'],
    Description: 'Sunucudaki banlıların listesini verir.',
    Usage: 'banlist',
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

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("bans")
                .setLabel("🔒 Yasaklamalar")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("forcebans")
                .setLabel("🔓 Kalkmaz Yasaklama")
                .setStyle(ButtonStyle.Secondary)
        )

        const msg = await message.channel.send({ content: `Ban listesi için aşağıdaki butonlardan birini kullanabilirsiniz.`, components: [row] });
        const filter = (i) => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            i.deferUpdate();

            if (i.customId === "bans") {
                const bans = await message.guild.bans.fetch()
                if (!bans.size) return msg.edit({ embeds: null, content: `Sunucuda yasaklama bulunmamaktadır.` });

                const banList = bans.map((ban) => `• ${ban.user.username} (${ban.user.id})`).join('\n');
                msg.edit({ content: `Sunucudaki yasaklamalar;\n${banList}` });
            } else if (i.customId === "forcebans") {
                const bans = await ForceBan.find();
                if (!bans.length) return msg.edit({ embeds: null, content: `Sunucuda kalkmaz yasaklama bulunmamaktadır.` });

                const list = bans.map(async (x) => {
                    const user = await client.getUser(x.ID);
                    return `• #${x.No} | ${user.username} (${user.id})`;
                })

                const promise = await Promise.all(list);

                msg.edit({ content: `Sunucudaki kalkmaz yasaklamalar;\n${promise.join('\n')}` });
            }
        });
  },
};