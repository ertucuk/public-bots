const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, bold, EmbedBuilder } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');
const { components } = require('../../../../Global/Helpers/Extenders/Message');

const titles = {
  ['Male']: 'Erkek',
  ['Girl']: 'Kadın',
  ['Unregister']: 'Kayıtsız',
  ['ChangeNickname']: 'İsim Değiştirme',
  ['AutoRegister']: 'Otomatik Kayıt',
  ['Quit']: 'Sunucudan Ayrılma',
  ['Gender']: 'Cinsiyet Değiştirme'
}

module.exports = {
  Name: 'isimler',
  Aliases: ['isimler'],
  Description: 'Belirlenen üyenin daha önceki isim ve yaşlarını gösterir.',
  Usage: 'isimler <@User/ID>',
  Category: 'Register',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {

    if (!message.guild.settings.registerAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
    if (!message.guild.settings.registerSystem) return message.reply({ content: `${client.getEmoji("mark")} Bu sunucuda kayıt sistemi devre dışı bırakılmış.` });

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    if (!member) return message.reply(global.cevaplar.üyeyok).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

    const document = await User.findOne({ userID: member.id });
    if (!document || !document.Names) return message.reply({ content: `${client.getEmoji("mark")} ${member} adlı üyenin isim geçişi bulunmuyor.` }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

    let page = 1;
    const totalData = Math.ceil(document.Names.length / 10);
    const mappedData = document && document.Names ? document.Names.map((x) => `[<t:${Math.floor(x.Date / 1000)}:R>] ${x.Name} - ${bold(titles[x.Type])}`) : "";

    const embed = new EmbedBuilder({
      color: client.random(),
      description: `${member} üyesinin toplamda **${document.Names.length || 0}** isim kayıtı bulundu.\n\n${mappedData.slice(0, 10).join('\n')}`
    });

    const msg = await message.channel.send({
      embeds: [embed],
      components: document.Names.length >= 10 ? [client.getButton(page, totalData)] : []
    })

    if (10 > document.Names.length) return

    const filter = (i) => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 })

    collector.on('collect', async i => {

      i.deferUpdate();
      if (i.customId === 'first') page = 1;
      if (i.customId === 'previous') page -= 1;
      if (i.customId === 'next') page += 1;
      if (i.customId === 'last') page = totalData;

      msg.edit({
        embeds: [embed.setDescription(`${member} üyesinin toplamda **${document.Names.length || 0}** isim kayıtı bulundu.\n\n${mappedData.slice((page - 1) * 10, page * 10).join('\n')}`)],
        components: [client.getButton(page, totalData)]
      })
    });
  },
};