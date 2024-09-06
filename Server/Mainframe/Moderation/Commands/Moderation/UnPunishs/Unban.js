const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Punitive, User, ForceBan, Mute, VoiceMute, Jail } = require('../../../../../Global/Settings/Schemas');

module.exports = {
  Name: 'yargıkaldır',
  Aliases: ['yargıkaldır', 'yargı-kaldır', 'yargi-kaldir', 'yargikaldir', 'unyargı'],
  Description: 'Belirlenen üyenin sunucu yasaklamasını kaldırır.',
  Usage: 'yargıkaldır <@User/ID>',
  Category: 'Moderation',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

    if (!message.guild.settings.banAuth.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) return message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));

    const member = await client.getUser(args[0]);
    if (args[0] === message.author.id) return message.reply(global.cevaplar.kendi).then(x => { setTimeout(() => { x.delete() }, 5000) })

    const punitiveRecord = await Punitive.findOne({ Member: args[0], Type: "Yasaklama", Active: true }).exec();
    const bans = await message.guild.bans.fetch();
    if (bans.size === 0) return message.channel.send(global.cevaplar.yasaklamayok);

    const bannedMember = bans.find(x => x.user.id == args[0]);
    if (!bannedMember) return message.channel.send({ content: `Bu üye banlı değil!` });
    if (punitiveRecord) await Punitive.updateOne({ No: punitiveRecord.No }, { $set: { "Active": false, Expried: Date.now(), Remover: message.member.id } }, { upsert: true });

    message.guild.members.unban(args[0]);
    const logChannel = await client.getChannel('ban-log', message)
    if (logChannel) logChannel.send({ embeds: [new global.VanteEmbed().setDescription(`${member} üyesinin sunucudaki ${punitiveRecord ? `\`#${punitiveRecord.No}\` ceza numaralı yasaklaması` : "yasaklaması"}, ${client.timestamp(Date.now())} ${message.author} tarafından kaldırıldı.`)] });
    message.reply(`${client.getEmoji("check")} Başarıyla ${member} üyesinin ${punitiveRecord ? `(\`#${punitiveRecord.No}\`) ceza numaralı` : "sunucudaki"} yasaklaması kaldırıldı!`);
    message.react(`${client.getEmoji("check")}`)
  },
};