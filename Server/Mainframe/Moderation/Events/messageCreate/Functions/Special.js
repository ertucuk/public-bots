const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = async function specialHandler(client, message, prefix) {
    const data = message.guild.settings.perms || [];
    let cmd, args;

    if (prefix) {
        args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args[0].toLowerCase();
        cmd = data.find((cmd) => cmd.permName === command);
        args.shift();

        if (!cmd && [`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(prefix)) {
            cmd = data.find((cmd) => cmd.permName === command);
            args.shift();
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!cmd) return;
        if (!hasPermission(message, cmd)) {
            message.reply({ content: `${client.getEmoji('mark')} Bu komutu kullanma yetkiniz bulunmamaktadır.` });
            return;
        }

        if (!member) {
            message.reply({ content: `${client.getEmoji('mark')} Bir kullanıcı belirtmelisiniz.` });
            return;
        }

        if (hasRole(member, cmd.permRoles2)) {
            await removeRoles(client, message, member, cmd.permRoles2);
        } else {
            await addRoles(client, message, member, cmd.permRoles2);
        }
    }
};

function hasPermission(message, cmd) {
    const member = message.member;
    const hasRole = Array.isArray(cmd.permRoles) ? cmd.permRoles.some((role) => member.roles.cache.has(role)) : member.roles.cache.has(cmd.permRoles);

    return hasRole && member.permissions.has(PermissionsBitField.Flags.Administrator) && member.permissions.has(PermissionsBitField.Flags.ManageRoles);
}

function hasRole(member, roles) {
    return Array.isArray(roles) 
        ? roles.some((role) => member.roles.cache.has(role)) 
        : member.roles.cache.has(roles);
}

async function removeRoles(client, message, member, roles) {
    const removedRoles = member.roles.cache.filter((role) => hasRole({ roles: [role.id] }, roles)).map((role) => role.id);
    await member.roles.remove(removedRoles);
    message.react(client.getEmoji("check"));
    await sendRoleChangeMessage(client, message, member, roles, 'alındı');
    await logRoleChange(client, message, member, removedRoles, 'alındı');
}

async function addRoles(client, message, member, roles) {
    for (const role of roles) {
        await member.roles.add(role);
    }
    message.react(client.getEmoji("check"));
    await sendRoleChangeMessage(client, message, member, roles, 'verildi');
    await logRoleChange(client, message, member, roles, 'verildi');
}

async function sendRoleChangeMessage(client, message, member, roles, action) {
    const roleNames = Array.isArray(roles) ? roles.map((role) => `<@&${role}>`).join(', ') : `<@&${roles}>`;
    const roleText = Array.isArray(roles) ? `${roles.length > 1 ? "rolleri" : "rolü"}` : `rolü`;

    const embed = new EmbedBuilder({
        color: client.random(),
        timestamp: new Date(),
        author: { name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) },
        description: `${client.getEmoji("check")} ${member} kullanıcısından ${roleNames} ${roleText} ${action}.`
    })
 
    const sentMessage = await message.channel.send({ embeds: [embed] });
    setTimeout(() => sentMessage.delete(), 5000);
}

async function logRoleChange(client, message, member, roles, action) {
    const logChannel = await client.getChannel('role-log', message);
    if (!logChannel) return;

    const roleNames = Array.isArray(roles) ? roles.map((role) => `<@&${role}>`).join(', ') : `<@&${roles}>`;
    const embed = new EmbedBuilder({
            color: client.random(),
            timestamp: new Date(),
            author: { name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) },
            description: `${message.author} tarafından ${member} adlı kullanıcıdan rol(ler) ${action}.`,
            fields: [
                { name: 'Kullanıcı', value: `${member}\n(\`${member.id}\`)`, inline: true },
                { name: 'Yetkili', value: `${message.author}\n(\`${message.author.id}\`)`, inline: true },
                { name: `İşlem Yapılan ${roles.length > 1 ? 'Roller' : 'Rol'}`, value: roleNames, inline: true },
            ]
    })
     
    logChannel.send({ embeds: [embed] });
}