const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, codeBlock, inlineCode, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, bold } = require('discord.js');
const Staffs = require('../../../../Global/Base/Staff');
const { Staff, User } = require('../../../../Global/Settings/Schemas')

module.exports = {
    Name: 'görevlerim',
    Aliases: ['görev', 'görevlerim'],
    Description: 'Sunucudaki görevleri gösterir.',
    Usage: 'görevlerim <@User/ID>',
    Category: 'Auth',
    Cooldown: 0,

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member) {
            message.reply(global.cevaplar.üyeyok).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && member.id !== message.author.id) {
            message.reply({ content: `${client.getEmoji('mark')} Yetkili değilsiniz!` })
            return;
        }

        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !message.guild.settings.maxStaffs.some((r) => member.roles.cache.has(r))) {
            message.reply({ content: `${client.getEmoji('mark')} ${member.id === message.author.id ? 'Üst yetkili değilsiniz.' : 'Bu üye üst yetkili değil.'}` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const staffControl = await Staffs.checkStaff(member);
        if (!staffControl) {
            message.reply({ content: `${client.getEmoji('mark')} Bu üye yetkili değil.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const { newRole } = await Staffs.getRank(member.roles.cache.map((r) => r.id))
        const document = await Staff.findOne({ id: member.id })
        if (!document) {
            message.reply({ content: `${client.getEmoji('mark')} Göreviniz bulunmamaktadır. Görev seçme kanalından görev seçebilirsiniz.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const userDocument = await User.findOne({ userID: member.id });

        if (!document.tasks.length) {
            message.reply({ content: `${client.getEmoji('mark')} Göreviniz bulunmamaktadır. Görev seçme kanalından görev seçebilirsiniz.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));
            return;
        }

        const embed = buildEmbed(client, member, document, userDocument, newRole);
        message.reply({ embeds: [embed] });
    },
};

function buildEmbed(client, member, document, userDocument, newRole) {

    let total = 0;
    let count = 0;

    document.tasks.forEach((task) => {
        total += (task.currentCount >= task.requiredCount ? task.requiredCount : task.currentCount) / task.requiredCount * 100
        count++;
    });

    let average = total / count;

    return new EmbedBuilder({
        timestamp: new Date(),
        author: { name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) },
        footer: { text: `ertu was here ❤️`, iconURL: member.guild.iconURL({ dynamic: true }) },
        description: [
            `${member} adlı üyenin görev durumu;\n`,
            `${bold(`${client.getEmoji('exclamation')} Genel Bilgiler;`)}\n`,
            `${inlineCode('Görev Seçim Tarihi   :')} ${client.timestamp(document.roleStarted)}`,
            `${inlineCode('Son Görülme          :')} ${userDocument?.LastVoice ? `${client.getEmoji('voice')} ${client.timestamp(userDocument.LastVoice)}` : `${client.getEmoji('voice')} Bilinmiyor`} / ${userDocument?.LastMessage ? `${client.getEmoji('message')} ${client.timestamp(userDocument.LastMessage)}` : `${client.getEmoji('message')} Bilinmiyor`}`,
            `${inlineCode('Aldığı Görev         :')} ${document?.task ? `${document.task} Görevi` : 'Görev Seçilmemiş'}`,
            `${inlineCode('İlerleme Durumu      :')} ${createBar(average, 100)} (${inlineCode(` %${Math.floor(average)} `)})`,
            `${inlineCode('Durum                :')} ${document.tasks.every((t) => t.completed) ? 'Görevleriniz tamamlandı!' : `Devam Etmelisin! (Kalan: %${100 - Math.floor(average)})`}\n`,
            `${bold(`${client.getEmoji('exclamation')} Görevlerin;`)}\n`,
            `${document.tasks.map(t => `${client.getEmoji('point')}\` ${t.name.padEnd(20, ' ')}: \` ${control(t)}`).join('\n')}\n`,
            `${bold('Bilgilendirme')}`,
            `${newRole?.ROLE ? `Görevlerinizin %100 olması durumunda <@&${newRole?.ROLE}> yetkisine yükseleceksiniz.` : 'Son yetkide bulunuyorsunuz.'}`,
        ].join('\n'),
    });
}

function createBar(current, required) {
    const percentage = Math.min((100 * current) / required, 100);
    const progress = Math.max(Math.round((percentage / 100) * 4), 0);
    let str = emoji(percentage > 0 ? 'Start' : 'EmptyStart');
    str += emoji('Mid').repeat(progress);
    str += emoji('EmptyMid').repeat(4 - progress);
    str += emoji(percentage === 100 ? 'End' : 'EmptyEnd');
    return str;
}

function emoji(name) {
    const findedEmoji = client.emojis.cache.find((e) => e.name === name);
    return findedEmoji ? findedEmoji.toString() : '';
}

function control(taskData) {
    const { currentCount, requiredCount, type } = taskData;
    const current = ['AFK', 'STREAMER', 'PUBLIC', 'REGISTER-VOICE'].includes(type) ? formatDurations(currentCount) : currentCount;
    const required = ['AFK', 'STREAMER', 'PUBLIC', 'REGISTER-VOICE'].includes(type) ? formatDurations(requiredCount) + ' saat' : requiredCount + ' adet';

    if (currentCount >= requiredCount) {
        return `Tamamlandı ${client.getEmoji('check')}`
    }

    return `__${current}__/**${required}** ${`(**%${Math.floor((currentCount / requiredCount) * 100)}**)`}`
}

function formatDurations(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    return `${String(hours).padStart(2, '')}`;
}