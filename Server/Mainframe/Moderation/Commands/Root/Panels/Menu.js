const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    Name: 'rolmenü',
    Aliases: ['menü', 'role-select', 'menu', 'rolselect', 'rol-menu', 'rolmenu'],
    Description: 'Rol seçme mesajını attırırsınız.',
    Usage: 'rolmenü',
    Category: 'Root',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('event-role').setLabel("Etkinlik Katılımcısı").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('giveaway-role').setLabel("Çekiliş Katılımcısı").setStyle(ButtonStyle.Success),
        );

        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('color-roles')
                .setPlaceholder('Renk rollerini seçmek için tıkla!')
                .addOptions([
                    { label: 'Gri', value: 'gri', emoji: { id: '1217564394309947495' } },
                    { label: 'Siyah', value: 'siyah', emoji: { id: '1217564387649388554' } },
                    { label: 'Beyaz', value: 'beyaz', emoji: { id: '1217564357810978897' } },
                    { label: 'Kırmızı', value: 'kırmızı', emoji: { id: '1217564350320083075' } },
                    { label: 'Mavi', value: 'mavi', emoji: { id: '1217564417672351775' } },
                    { label: 'Sarı', value: 'sarı', emoji: { id: '1217564355625746606' } },
                    { label: 'Yeşil', value: 'yeşil', emoji: { id: '1217564391344701532' } },
                    { label: 'Mor', value: 'mor', emoji: { id: '1217564359216337051' } },
                    { label: 'Turuncu', value: 'turuncu', emoji: { id: '1217564396176412823' } },
                    { label: 'Pembe', value: 'pembe', emoji: { id: '1217564354548072508' } },
                    { label: 'Kahverengi', value: 'kahverengi', emoji: { id: '1217564389432102942' } },
                    { label: 'Rol İstemiyorum', value: 'rolistemiom-1', emoji: { id: '1150046811327832095' } },
                ])
        )

        const row3 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('zodiac-roles')
                .setPlaceholder('Burç rollerini seçmek için tıkla!')
                .addOptions([
                    { label: 'Koç', value: 'koç', emoji: { id: '1217561413841719429' } },
                    { label: 'Boğa', value: 'boğa', emoji: { id: '1217561482280042590' } },
                    { label: 'İkizler', value: 'ikizler', emoji: { id: '1217561419730387014' } },
                    { label: 'Yengeç', value: 'yengeç', emoji: { id: '1217561416366559233' } },
                    { label: 'Aslan', value: 'aslan', emoji: { id: '1217561594041602188' } },
                    { label: 'Başak', value: 'başak', emoji: { id: '1217561480841400331' } },
                    { label: 'Terazi', value: 'terazi', emoji: { id: '1217561591705370746' } },
                    { label: 'Akrep', value: 'akrep', emoji: { id: '1217561476282322947' } },
                    { label: 'Yay', value: 'yay', emoji: { id: '1217561479155421284' } },
                    { label: 'Oğlak', value: 'oğlak', emoji: { id: '1217561417947938857' } },
                    { label: 'Kova', value: 'kova', emoji: { id: '1217561412344479875' } },
                    { label: 'Balık', value: 'balık', emoji: { id: '1217561475049193602' } },
                    { label: 'Rol İstemiyorum', value: 'rolistemiom', emoji: { id: '1150046811327832095' } },
                ])
        )

        const row4 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('relationship-roles')
                .setPlaceholder('İlişki rollerini seçmek için tıkla!')
                .addOptions([
                    { label: 'İlişkisi Var', value: 'couple', emoji: { id: '1150046674698383390' } },
                    { label: 'İlişkisi Yok', value: 'alone', emoji: { id: '1217557986524921857' } },
                    { label: 'Rol İstemiyorum', value: 'rolistemiom-2', emoji: { id: '1150046811327832095' } },
                ])
        )

        const row5 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('game-roles')
                .setPlaceholder('Oyun rollerini seçmek için tıkla!')
                .addOptions([
                    { label: 'Valorant', value: 'valorant', emoji: { id: '1150046684768907385' } },
                    { label: 'League Of Legends', value: 'lol', emoji: { id: '1150046688594104401' } },
                    { label: 'Minecraft', value: 'minecraft', emoji: { id: '1150046690129231982' } },
                    { label: 'CS:GO', value: 'csgo', emoji: { id: '1150046686606000230' } },
                    { label: 'GTA V', value: 'gta', emoji: { id: '1150046679685406780' } },
                    { label: 'PUBG', value: 'pubg', emoji: { id: '1150046683246374953' } },
                    { label: 'Fortnite', value: 'fortnite', emoji: { id: '1150046678154485760' } },
                    { label: 'ROBLOX', value: 'roblox', emoji: { id: '1198644651419250899' } },
                    { label: 'Rol İstemiyorum', value: 'rolistemiom-3', emoji: { id: '1150046811327832095' } },
                ])
        )

        if (message) message.delete().catch(err => { });
        message.channel.send({
            content: `
**Merhaba __${message.guild.name}__ üyeleri,**
Sunucuda sizleri rahatsız etmemek için @everyone veya @here atmayacağız. Sadece isteğiniz doğrultusunda aşağıda bulunan tepkilere tıklarsanız Çekilişler,Etkinlikler V/K ve D/C'den haberdar olacaksınız.
Eğer Çekiliş Katılımcısı Butonuna tıklarsanız sunucumuzda sıkça vereceğimiz nice ödüllerin bulunduğu çekilişlerden haberdar olabilirsiniz.

Eğer Etkinlik Katılımcısı Butonuna tıklarsanız sunucumuzda düzenlenecek olan etkinlikler, konserler ve oyun etkinlikleri gibi etkinliklerden haberdar olabilirsiniz.

Aşağıda ki butonlara basarak siz de bu ödülleri kazanmaya hemen başlayabilirsiniz!`, components: [row, row2, row3, row5, row4]
        });

    },
};