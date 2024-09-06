const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, AttachmentBuilder, bold } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas')

module.exports = {
  Name: 'ship',
  Aliases: [],
  Description: 'Random veya belirttiğiniz üyeyi shipler.',
  Usage: 'ship <@User/ID>',
  Category: 'Global',
  Cooldown: 0,

  Command: {
    Prefix: true,
  },

  messageRun: async (client, message, args) => {
    if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
      message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
      return;
    }

    const ertuman = message.guild.settings.manRoles[0];
    const ertuwoman = message.guild.settings.womanRoles[0];
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.filter(m => m.user.bot === false && message.member.roles.cache.has(ertuman) ? m.roles.cache.get(ertuwoman) : m.roles.cache.get(ertuman)).random();

    const replies = ['5% Uyumlu!', '3% Uyumlu!', '10% Uyumlu!', '14% Uyumlu!', '17% Uyumlu!', '20% Uyumlu!', '22% Uyumlu!', '25% Uyumlu!', '24% Uyumlu!', '27% Uyumlu!', '32% Uyumlu!', '36% Uyumlu!', '34% Uyumlu!', '39% Uyumlu!', '42% Uyumlu!', '45% Uyumlu!', '47% Uyumlu!', '51% Uyumlu!', '54% Uyumlu!', '56% Uyumlu!', '59% Uyumlu!', '58% Uyumlu!', '60% Uyumlu!', '63% Uyumlu!', '65% Uyumlu!', '64% Uyumlu!', '68% Uyumlu!', '70% Uyumlu!', '74% Uyumlu!', '78% Uyumlu!', '79% Uyumlu!', '80% Uyumlu!', '83% Uyumlu!', '86% Uyumlu!', '84% Uyumlu!', '89% Uyumlu!', '91% Uyumlu!', '93% Uyumlu!', '95% Uyumlu!', '97% Uyumlu!', '98% Uyumlu!', '99% Uyumlu!', 'Evlenek Ne Bekliyon', 'Çabuk Evlenmeniz Gereken Konular Var'];

    const emoti = global.system.ownerID.includes(message.member.id) ? 43 : Math.floor(Math.random() * replies.length);
    const love = replies[emoti];
    const emoticon = emoti <= 44 && emoti >= 23 ? 'https://cdn.glitch.com/00963c7e-8e86-4a55-8d85-36add9e330d7%2Femoji_2.png?v=1593651528429' : (emoti < 23 && emoti >= 12 ? 'https://cdn.glitch.com/00963c7e-8e86-4a55-8d85-36add9e330d7%2Femoji_3-1.png?v=1593652255529' : 'https://cdn.glitch.com/00963c7e-8e86-4a55-8d85-36add9e330d7%2Femoji_1.png?v=1593651511900');

    const canvas = createCanvas(384, 128);
    const ctx = canvas.getContext('2d');
    const emotes = await loadImage(emoticon);
    const avatar1 = await loadImage(message.member.user.displayAvatarURL() ? message.member.user.displayAvatarURL({ extension: "jpg" }) : "https://img001.prntscr.com/file/img001/OmAeuxfoQreRyIrri5eqRw.png");
    const avatar2 = await loadImage(member.user.displayAvatarURL() ? member.user.displayAvatarURL({ extension: "jpg" }) : "https://img001.prntscr.com/file/img001/OmAeuxfoQreRyIrri5eqRw.png");
    ctx.beginPath();
    ctx.moveTo(0 + Number(10), 0);
    ctx.lineTo(0 + 384 - Number(10), 0);
    ctx.quadraticCurveTo(0 + 384, 0, 0 + 384, 0 + Number(10));
    ctx.lineTo(0 + 384, 0 + 128 - Number(10));
    ctx.quadraticCurveTo(0 + 384, 0 + 128, 0 + 384 - Number(10), 0 + 128);
    ctx.lineTo(0 + Number(10), 0 + 128);
    ctx.quadraticCurveTo(0, 0 + 128, 0, 0 + 128 - Number(10));
    ctx.lineTo(0, 0 + Number(10));
    ctx.quadraticCurveTo(0, 0, 0 + Number(10), 0);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 384, 128);
    let background = await loadImage(message.guild.bannerURL() ? message.guild.bannerURL({ format: "png", size: 2048 }) : "https://img001.prntscr.com/file/img001/rqZGlANaRNCa2WixBBjy_w.jpg");
    ctx.drawImage(background, 0, 0, 384, 129);
    ctx.drawImage(emotes, 160, 30, 64, 64);
    ctx.drawImage(avatar1, 20, 20, 96, 96);
    ctx.drawImage(avatar2, 270, 20, 96, 96);
    const buffer = canvas.toBuffer('image/png')
    let content = `[ ${bold(message.member.displayName)} & ${bold(member.displayName)} ]\nUyum Oranı: ${bold(love)}`;
    message.reply({ content: content, files: [buffer] });
  },
};