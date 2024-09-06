const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder } = require('discord.js');
const { Punitive, User, ForceBan } = require('../../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'sicil',
  Aliases: ['cezalar'],
  Description: 'Belirlenen üyenin bütün ceza verisini gösterir.',
  Usage: 'sicil <@User/ID>',
  Category: 'Moderation',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    if (!message.guild.settings.staffs.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
      message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
      return;
    }

    const member = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.member;
    if (!member) {
      message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
      return;
    }

    const PunitiveControl = await Punitive.find({ Member: member.id })
    if (PunitiveControl.length === 0) {
      message.reply({ content: 'Belirtilen üyenin herhangi bir ceza verisi bulunamadı.' }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
      return;
    }

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("Member-Penals")
        .setPlaceholder('Sicil Kayıtları')
        .addOptions([
          ...PunitiveControl.slice(0, 25).map((x) => ({
            value: `${x.No}`,
            label: `${x.Type} (#${x.No})`,
            description: `${x.Reason && x.Reason.length > 100 ? x.Reason.substring(0, 98).trim() + '..' : x.Reason || 'Sebep belirtilmemiş'}`,
          }))
        ])
    )

    const tip = PunitiveControl.map(x => (x.Type))
    const chatMute = tip.filter(x => x == "Metin Susturulma").length || 0
    const voiceMute = tip.filter(x => x == "Ses Susturulma").length || 0
    const jail = tip.filter(x => x == "Cezalandırılma").length || 0
    const ads = tip.filter(x => x == "Reklam").length || 0
    const ban = tip.filter(x => x == "Yasaklama" || x == "Kalkmaz Yasaklama").length || 0
    const underworld = tip.filter(x => x == "Underworld").length || 0
    const warn = tip.filter(x => x == "Uyarılma").length || 0
    const et = tip.filter(x => x == "Etkinlik Ceza").length || 0
    const st = tip.filter(x => x == "Streamer Ceza").length || 0

    const embed = new EmbedBuilder({
      color: client.random(),
      description: `${member} (\`${member.id}\`) adlı kullanıcının cezaları: (\`${PunitiveControl.length}\`)`,
      fields: [
        { name: "Chat Mute", value: `${chatMute}`, inline: true },
        { name: "Ses Mute", value: `${voiceMute}`, inline: true },
        { name: "Jail", value: `${jail}`, inline: true },
        { name: "Ban", value: `${ban}`, inline: true },
        { name: "Underworld", value: `${underworld}`, inline: true },
        { name: "Uyarı", value: `${warn}`, inline: true },
        { name: "Reklam", value: `${ads}`, inline: true },
        { name: "Etkinlik Cezalı", value: `${et}`, inline: true },
        { name: "Streamer Cezalı", value: `${st}`, inline: true }
      ]
    })

    const components = [selectMenu]
    const totalPenals = Math.ceil(PunitiveControl.length / 25)
    let page = 1
    if (PunitiveControl.length > 25) components.push(client.getButton(page, totalPenals));

    const msg = await message.reply({ embeds: [embed], components: components })
    const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 5 });

    collector.on('collect', async (i) => {
      if (i.isStringSelectMenu()) {
        const data = await Punitive.findOne({ No: i.values[0] })
        if (!data) return;

        const embed = new EmbedBuilder({
          color: client.random(),
          image: { url: 'attachment://proof.png' ?? undefined },
          thumbnail: { url: message.guild.iconURL({ dynamic: true }) },
          description: `- **#${data.No}** ID'li **${data.Active ? 'aktif' : 'pasif'}** cezanın detayları aşağıda yer almaktadır.`,
          fields: [
            {
              name: 'İşlem Uygulayan Yetkili',
              value: `<@${data.Staff}> (${data.Staff})`,
              inline: true
            },
            {
              name: 'İşlem Tipi',
              value: `${data.Type}`,
              inline: true
            },
            {
              name: 'İşlem Sebebi',
              value: data.Reason ? `${data.Reason.length > 1024 ? data.Reason.substring(0, 1022).trim() + '..' : data.Reason}` : 'Sebep belirtilmemiş.',
              inline: false
            },
            {
              name: 'Süre Bilgileri',
              value: `İşlem <t:${Math.floor(data.Date / 1000)}> tarihinde (<t:${Math.floor(data.Date / 1000)}:R>) uygulanmış. \n\n${data.Expried || !data.Type === 'Uyarılma' ? `Verilen ceza <t:${Math.floor(data.Expried / 1000)}> tarihinde (<t:${Math.floor(data.Expried / 1000)}:R>) sona ${data.Active ? 'erecek' : 'ermiş'}.` : ''}`,
              inline: false
            }
          ]
        })

        return i.reply({ embeds: [embed], ephemeral: true, files: data.Image ? [image] : [] });
      }

      if (i.isButton()) {
        i.deferUpdate();
        if (i.customId === 'first') page = 1;
        if (i.customId === 'previous') page -= 1;
        if (i.customId === 'next') page += 1;
        if (i.customId === 'last') page = totalPenals;

        const selectMenu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("Member-Penals")
            .setPlaceholder('Sicil Kayıtları')
            .addOptions([
              ...PunitiveControl.slice(page === 1 ? 0 : page * 25 - 25, page * 25).map((x) => ({
                value: `${x.No}`,
                label: `${x.Type} (#${x.No})`,
                description: `${x.Reason && x.Reason.length > 100 ? x.Reason.substring(0, 98).trim() + '..' : x.Reason || 'Sebep belirtilmemiş'}`,
              }))
            ])
        )

        msg.edit({
          embeds: [embed],
          components: [selectMenu, client.getButton(page, totalPenals)]
        })
      }
    })
  },
};