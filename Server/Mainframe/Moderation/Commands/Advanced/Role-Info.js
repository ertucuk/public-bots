const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, codeBlock } = require('discord.js');

module.exports = {
    Name: 'rolsay',
    Aliases: ['rol-bilgi', 'roleinfo', 'role-info', 'rolinfo', 'rolbilgi'],
    Description: 'Belirtilen rolün detaylarını gösterir.',
    Usage: 'rolsay <@Rol/RolID>',
    Category: 'Staff',
    Cooldown: 0,

    Command: { Prefix: true },

    messageRun: async (client, message, args) => {

        if (!message.guild.settings.leaderRoles.some(x => message.member.roles.cache.has(x)) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator)) {
            message.reply(global.cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        } 
        
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role || role.id === message.guild?.id) {
            message.reply({ content: "Geçerli bir rol belirtmelisiniz." }).then(s => setTimeout(() => s.delete().catch(err => { }), 5000));
            return;
        }

        const char = args.includes('@') ? ', ' : '\n';
        const members = message.guild.members.cache.filter(m => m.roles.cache.has(role.id));

        const roleInfo = `${role.name} (${role.id}) | Rolde ${members.size} kişi bulunuyor.`;
        const memberList = members.map(member => `ID: <@${member.id}> - Kullanıcı Adı: ${member.displayName}`).join(char);

        const text = `${codeBlock('js', roleInfo)}\n${codeBlock('js', memberList)}`;
        const texts = splitMessage(text, { maxLength: 1500, char });

        for (const part of texts) {
            message.channel.send(part);
        }
    },
};

function splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
    if (text.length <= maxLength) return [append + text + prepend];
    const splitText = text.split(char);
    const messages = [];
    let msg = '';
    for (const chunk of splitText) {
        if (msg && (msg + char + chunk + append).length > maxLength) {
            messages.push(msg + append);
            msg = prepend;
        }
        msg += (msg && msg !== prepend ? char : '') + chunk;
    }
    return messages.concat(msg).filter(m => m);
}