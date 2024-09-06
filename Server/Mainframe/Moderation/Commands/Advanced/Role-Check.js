const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, codeBlock } = require('discord.js');

module.exports = {
    Name: 'roldenetim',
    Aliases: ['rol-denetim', 'ysay'],
    Description: 'Belirttiğiniz rolün üye bilgilerini gösterir.',
    Usage: 'roldenetim <@Rol/ID>',
    Category: 'Staff',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.ownerRoles.some(ertu => message.member.roles.cache.has(ertu)) && !message.guild.settings.leaderRoles.some(ertu => message.member.roles.cache.has(ertu)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role || role.id === message.guild?.id) {
            message.reply({ content: "Geçerli bir rol belirtmelisiniz." }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const voiceMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(role.id) && m.voice.channelId);
        const notVoiceMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(role.id) && !m.voice.channelId);
        const activeAndNotVoiceMembers = message.guild.members.cache.filter((m) => m.roles.cache.has(role.id) && !m.voice.channelId && m.presence && m.presence.status !== 'offline');
        const voiceText = voiceMembers.map((member) => `ID: ${member.id} - Kullanıcı Adı: ${member.displayName}`).join('\n');

        const voice = splitMessage(`Seste Olanlar\n\n${voiceText}`, { maxLength: 2000, char: '\n' });
        const notVoiceText = notVoiceMembers.map((member) => `ID: ${member.id} - Kullanıcı Adı: ${member.displayName}`).join('\n');
        const notVoiceText2 = activeAndNotVoiceMembers.map((member) => `<@${member.id}>`).listArray()
        console.log(notVoiceText2)
        const notVoice = splitMessage(
            `Seste Olmayanlar\n\n${notVoiceText}`,
            { maxLength: 2000, char: '\n' }
        );

        const notVoice2 = splitMessage(`${notVoiceText2}`, { maxLength: 2000, char: '\n' });
        const contentArray = [
            codeBlock('js', `Rol İsmi: ${role.name} (${role.id}) | ${role.members.size} Üye | Seste Olmayan Üye: ${notVoiceMembers.size} | Aktif Olup Seste Olmayan Üye: ${activeAndNotVoiceMembers.size}`),
            codeBlock('js', voice[0]),
            codeBlock('js', notVoice[0]),
            codeBlock('js', notVoice2[0].length !== 0 ? notVoice2[0] : '\u200b')
        ];

        for (const content of contentArray) {
            await sendMessage(content, message);
        }
    }
};

function splitMessage(content, options = {}) {
    const { maxLength = 2000, char = "\n", prepend = "", append = "" } = options;

    const chunks = [];
    const lines = content.split(char);

    let currentChunk = "";
    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = prepend + line + char;
        } else {
            currentChunk += (currentChunk ? char : "") + line;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    if (chunks.length > 1) {
        return chunks.map((chunk) => `${prepend}${chunk}${append}`);
    } else {
        return [`${prepend}${chunks[0]}${append}`];
    }
}

async function sendMessage(content, message) {
    if (content.length > 2000) {
        const chunks = splitMessage(content, { maxLength: 2000 });
        for (const chunk of chunks) {
            await message.channel.send({ content: chunk });
        }
    } else {
        await message.channel.send({ content });
    }
}
