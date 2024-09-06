const { ApplicationCommandType, PermissionsBitField: { Flags } } = require('discord.js');
const VanteEmbed = require('../../Global/Services/Embed');

const MessageCommandsHandler = async function (client, message) {
    if (!message.guild || message.author.bot) return;

    const prefixes = [...client.Vante.Prefix, `<@${client.user.id}>`, `<@!${client.user.id}>`];
    const content = message.content;
    
    const prefixUsed = prefixes.find(p => content.startsWith(p));
    let args;

    if (prefixUsed) {
        args = content.slice(prefixUsed.length).trim().split(/ +/);
        const command = args[0].toLowerCase();
        var cmd = client.commands.get(command) || client.aliases.get(command)
        args.shift();

        if (!cmd && [`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(prefixUsed)) {
            cmd = client.commands.get(args[0]) || client.aliases.get(command)
            args.shift();
        };
    };

    if (cmd) {
        const cooldown = client.cooldowns.get(`${cmd.Name}-${message.author.id}`);
        if (!message.channel.permissionsFor(message.guild.members.me).has('SendMessages')) return;

        if (cooldown && cooldown.Activated) return;

        if (cmd.Category === 'Root' && !client.system.ownerID.includes(message.author.id) && message.author.id !== '136619876407050240') {
            await message.react(client.getEmoji("mark") ? client.getEmoji("mark") : '❌');
            return client.embed(message, `Bu komut sadece geliştiricilere/ownerlara özeldir!`)
        };

        if (!message.member.permissions.has(Flags.Administrator) && !message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !client.data.channels.includes(message.channel.name)) {
            await message.react(client.getEmoji("mark") ? client.getEmoji("mark") : '❌');
            return client.embed(message, `Bu komutu bu kanalda kullanamazsın.`)
        }

        if (message.guild) { 
            let neededPermissions = [];
            if (cmd.Permissions && cmd.Permissions.Bot) cmd.Permissions.Bot.forEach((perm) => {
                if (!channel.permissionsFor(client.user)?.has(perm)) {
                    neededPermissions.push(perm);
                };
            });

            if (neededPermissions.length > 0) {
                const perms = new PermissionsBitField();
                neededPermissions.forEach((item) => perms.add(BigInt(item)));
                if (message.channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
                    return message.author.send({ content: `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim` }).then(() => {
                    }).catch(async () => {
                        await message.react(client.getEmoji("mark") ? client.getEmoji("mark") : '❌');
                        return client.embed(message, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
                    });
                } else {
                    await message.react(client.getEmoji("mark") ? client.getEmoji("mark") : '❌');
                    return client.embed(message, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
                }
            };

            neededPermissions = [];
            if (cmd.Permissions && cmd.Permissions.User) cmd.Permissions.User.forEach((perm) => {
                if (!message.channel.permissionsFor(message.member).has(perm)) {
                    neededPermissions.push(perm);
                }
            });


            if (neededPermissions.length > 0) {
                const perms = new PermissionsBitField();
                neededPermissions.forEach((item) => perms.add(BigInt(item)));
                await message.react(client.getEmoji("mark") ? client.getEmoji("mark") : '❌');
                return client.embed(message, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilsin`)
            };

            neededPermissions = [];
            if (cmd.Permissions && cmd.Permissions.Role) cmd.Permissions.Role.forEach((group) => {
                const hasRoleInGroup = group.some((role) =>
                    message.member.roles.cache.some((userRole) => userRole.id === role)
                );
        
                if (!hasRoleInGroup) {
                    missingRoles.push(group.join(', '));
                }
            });

            if (neededPermissions.length > 0) return await message.react(client.getEmoji("mark") ? client.getEmoji("mark") : '❌');
        };

        if (cooldown && Date.now() < cooldown.Expiration) {
            client.embed(message, `Bu komutu tekrar çalıştırmadan önce ${client.timestamp(cooldown.Expiration)} bekle!`, Math.ceil((cooldown.Expiration - Date.now()) / 1000))
            return client.cooldowns.set(`${cmd.Name}-${message.author.id}`, {
                Activated: true,
            });
        };

        try {
            await cmd.messageRun(client, message, args);
        } catch (err) { 
            await message.react(client.getEmoji("mark") ? client.getEmoji("mark") : '❌');
            client.embed(message, `Bir hata meydana geldi ve bu durumu bot sahiplerine ilettik. Sorunu en kısa sürede gidermek için çaba gösteriyoruz. Anlayışınız için teşekkür ederiz!`);

            return client.logger.error('@messageRun', {
                error: err,
                guild: message.guild,
                client: client,
            });
        } finally {
            if (cmd.Cooldown > 0 && !cooldown) {
                client.cooldowns.set(`${cmd.Name}-${message.author.id}`, {
                    Expiration: Date.now() + (cmd.Cooldown * 1000),
                    Activated: false,
                });
            }

            setTimeout(() => {
                if (client.cooldowns.get(`${cmd.Name}-${message.author.id}`)) 
                 return client.cooldowns.delete(`${cmd.Name}-${message.author.id}`);
            }, cmd.Cooldown * 1000);
        };

        const embed = new VanteEmbed(message.guild)
        .setDescription(`${message.author} tarafından ${message.channel} kanalında \` ${prefixUsed}${cmd.Name} \` komutu kullanıldı.\nKomut İçeriği: \`\`\`fix\n${message.content}\`\`\``)
        .addFields(
            { name: 'Komut Kanalı', value: `${message.channel}\n(\`${message.channel.id}\`)`, inline: true },
            { name: 'Komut Kullanan:', value: `${message.author}\n(\`${message.author.id}\`)`, inline: true },
            { name: 'Kullanma Zamanı', value: `${client.timestamp(Date.now(), "f")}\n${client.timestamp(Date.now())}`, inline: true },
        )

        const channel = await client.getChannel("command-log", message);
        if (channel) channel.wsend({ embeds: [embed] });
        
        return client.logger.log(`Command: ${cmd.Name} was ran by ${message.author.tag}${!message.guild ? ' in DM\'s' : ` in guild: ${message.guild.name}`}.`);
    };
};


const SlashCommandsHandler = async function (client, interaction) {
    const 
    guild   = interaction.guild,
    cmd     = client.slashCommands.get(interaction.commandName),
    channel = guild?.channels.cache.get(interaction.channelId),
    member  = guild?.members.cache.get(interaction.user.id);

    const cooldown = client.cooldowns.get(`${cmd.Name}-${interaction.user.id}`);

    if (!cmd || cooldown && cooldown.Activated) return;

    if (cmd.Category === 'Root' && !client.system.ownerID.includes(interaction.user.id) && interaction.user.id !== '136619876407050240') {
        return client.embed(interaction, `Bu komut sadece geliştiricilere/ownerlara özeldir!`)
    };

    if (guild) {
        let neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.Bot) cmd.Permissions.Bot.forEach((perm) => {
            if (!channel.permissionsFor(client.user)?.has(perm)) {
                neededPermissions.push(perm);
            };
        });

        if (neededPermissions.length > 0) {
            const perms = new PermissionsBitField();
            neededPermissions.forEach((item) => perms.add(BigInt(item)));
            if (interaction.channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
                return interaction.user.send({ content: `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim` }).then(() => {
                }).catch(() => {
                    return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
                });
            } else {
                return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
            }
        };

        neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.User) cmd.Permissions.User.forEach((perm) => {
            if (!interaction.channel.permissionsFor(interaction.user).has(perm)) {
                neededPermissions.push(perm);
            }
        });

        if (neededPermissions.length > 0) {
            const perms = new PermissionsBitField();
            neededPermissions.forEach((item) => perms.add(BigInt(item)));
            return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilsin!`)
        };

        neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.Role) cmd.Permissions.Role.forEach((group) => {
            const hasRoleInGroup = group.some((role) =>
                member.roles.cache.some((userRole) => userRole.id === role)
            );
        
            if (!hasRoleInGroup) {
                missingRoles.push(group.join(', '));
            }
        });

        if (neededPermissions.length > 0) return interaction.react("❌");
    }

    if (cooldown && Date.now() < cooldown.Expiration) {
        client.embed(interaction, `Bu komutu tekrar çalıştırmadan önce ${client.timestamp(cooldown.Expiration)} bekle!`, Math.ceil((cooldown.Expiration - Date.now()) / 1000))
        return client.cooldowns.set(`${cmd.Name}-${interaction.user.id}`, {
            Activated: true,
        });
    };

    try {
        await interaction.deferReply({ ephemeral: cmd.Command.Ephemeral });
        const settings = interaction.guild.settings
        await cmd.interactionRun(client, interaction, { settings });
    } catch (ex) {
        client.embed(interaction, `Bir hata meydana geldi ve bu durumu bot sahiplerine ilettik. Sorunu en kısa sürede gidermek için çaba gösteriyoruz. Anlayışınız için teşekkür ederiz!`);

        client.logger.error('@interactionRun', {
            error: ex,
            guild: interaction.guild,
            client: client,
        });
    } finally {
        if (cmd.Cooldown > 0 && !cooldown) {
            client.cooldowns.set(`${cmd.Name}-${interaction.user.id}`, {
                Expiration: Date.now() + (cmd.Cooldown * 1000),
                Activated: false,
            });
        }

        setTimeout(() => {
            if (client.cooldowns.get(`${cmd.Name}-${interaction.user.id}`)) 
                client.cooldowns.delete(`${cmd.Name}-${interaction.user.id}`);
        }, cmd.Cooldown * 1000);
    };

    const commands = await client.application.commands.fetch();
    const embed = new VanteEmbed(interaction.guild)
        .setDescription(`${interaction.user} tarafından ${channel} kanalında **${cmd.Name}** komutu kullanıldı.\n\n**Komut:** </${cmd.Name}:${commands.find(c => c.name === cmd.Name)?.id}>`)
        .addFields(
            { name: 'Komut Kanalı', value: `${channel}\n(\`${channel.id}\`)`, inline: true },
            { name: 'Komut Kullanan:', value: `${interaction.user}\n(\`${interaction.user.id}\`)`, inline: true },
            { name: 'Kullanma Zamanı', value: `${client.timestamp(Date.now(), "f")}\n${client.timestamp(Date.now())}`, inline: true },
        )

        const logChannel = await client.getChannel("command-log", interaction);
        if (logChannel) logChannel.wsend({ embeds: [embed] });

    return client.logger.log(`Command: ${cmd.Name} was ran by @${interaction.user.tag}${!interaction.guild ? ' in DM\'s' : ` in guild: ${interaction.guild.name}`}.`);
}; 


const ContextCommandsHandler = async function (client, interaction) {
    const 
    guild    = interaction.guild,
    cmd      = client.contextMenus.get(interaction.commandName),
    channel  = guild?.channels.cache.get(interaction.channelId),
    member   = guild?.members.cache.get(interaction.user.id);
    cooldown = client.cooldowns.get(`${cmd.Name}-${interaction.user.id}`);

    if (!cmd || cooldown && cooldown.Activated) return;

    if (guild) {
        let neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.Bot) cmd.Permissions.Bot.forEach((perm) => {
            if (!channel.permissionsFor(client.user)?.has(perm)) {
                neededPermissions.push(perm);
            };
        });

        if (neededPermissions.length > 0) {
            const perms = new PermissionsBitField();
            neededPermissions.forEach((item) => perms.add(BigInt(item)));
            if (interaction.channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
                return interaction.user.send({ content: `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim` }).then(() => {
                }).catch(() => {
                    return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
                });
            } else {
                return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilim`)
            }
        };

        neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.User) cmd.Permissions.User.forEach((perm) => {
            if (!interaction.channel.permissionsFor(interaction.user).has(perm)) {
                neededPermissions.push(perm);
            }
        });

        if (neededPermissions.length > 0) {
            const perms = new PermissionsBitField();
            neededPermissions.forEach((item) => perms.add(BigInt(item)));
            return client.embed(interaction, `Üzgünüm, bu komutu yürütemem çünkü yeterli izinlere sahip degilsin`)
        };

        neededPermissions = [];
        if (cmd.Permissions && cmd.Permissions.Role) cmd.Permissions.Role.forEach((group) => {
            const hasRoleInGroup = group.some((role) =>
                member.roles.cache.some((userRole) => userRole.id === role)
            );
    
            if (!hasRoleInGroup) {
                missingRoles.push(group.join(' ve '));
            }
        });

        if (neededPermissions.length > 0) return interaction.react("❌");
    };

    if (cooldown && Date.now() < cooldown.Expiration) {
        client.embed(interaction, `Bu komutu tekrar çalıştırmadan önce ${client.timestamp(cooldown.Expiration)} bekle!`, Math.ceil((cooldown.Expiration - Date.now()) / 1000))
        return client.cooldowns.set(`${cmd.Name}-${interaction.user.id}`, {
            Activated: true,
        });
    };

    try {
        await interaction.deferReply({ ephemeral: cmd.Ephemeral });
        const settings = interaction.guild.settings
        await cmd.interactionRun(client, interaction, { settings });
    } catch (ex) {
        client.embed(interaction, `Bir hata meydana geldi ve bu durumu bot sahiplerine ilettik. Sorunu en kısa sürede gidermek için çaba gösteriyoruz. Anlayışınız için teşekkür ederiz!`);

        client.logger.error('@contextRun', {
            error: ex,
            guild: interaction.guild,
            client: client,
        });
    } finally {
        if (cmd.Cooldown > 0 && !cooldown) {
            client.cooldowns.set(`${cmd.Name}-${interaction.user.id}`, {
                Expiration: Date.now() + (cmd.Cooldown * 1000),
                Activated: false,
            });
        }

        setTimeout(() => {
            if (client.cooldowns.get(`${cmd.Name}-${interaction.user.id}`)) 
                client.cooldowns.delete(`${cmd.Name}-${interaction.user.id}`);
        }, cmd.Cooldown * 1000);
    };

    const commands = await client.application.commands.fetch();


    const embed = new VanteEmbed(interaction.guild)
        .setDescription(`${interaction.user} tarafından ${channel} kanalında Context: **${cmd.Name}** komutu kullanıldı.`)
        .addFields(
            { name: 'Komut Kanalı', value: `${channel}\n(\`${channel.id}\`)`, inline: true },
            { name: 'Komut Kullanan:', value: `${interaction.user}\n(\`${interaction.user.id}\`)`, inline: true },
            { name: 'Kullanma Zamanı', value: `${client.timestamp(Date.now(), "f")}\n${client.timestamp(Date.now())}`, inline: true },
        )

        const logChannel = await client.getChannel("command-log", interaction);
        if (logChannel) logChannel.wsend({ embeds: [embed] });

    return client.logger.log(`Context: ${cmd.Name} was ran by @${interaction.user.tag}${!interaction.guild ? ' in DM\'s' : ` in guild: ${interaction.guild.name}`}.`);
}

module.exports = { ContextCommandsHandler, SlashCommandsHandler, MessageCommandsHandler }