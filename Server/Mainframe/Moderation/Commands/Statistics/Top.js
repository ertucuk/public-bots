const { PermissionsBitField: { Flags }, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder, bold } = require('discord.js');
const { User } = require('../../../../Global/Settings/Schemas');

module.exports = {
    Name: 'top',
    Aliases: ['sıralama'],
    Description: 'Sunucudaki genel sıralamayı gösterir.',
    Usage: 'top',
    Category: 'Stat',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        if (!message.guild.settings.ownerRoles.some(x => message.member.roles.cache.has(x)) && !message.member.permissions.has(Flags.Administrator) && !global.data.channels.includes(message.channel.name)) return message.reply({ content: `${client.getEmoji('mark')} Bu komutu bu kanalda kullanamazsın.` }).then((e) => setTimeout(() => { e.delete(); }, 10000));

        const titlesAndKeys = {
            Messages: { text: 'Mesaj Sıralama', emoji: '📝' },
            Voices:  { text: 'Ses Sıralama', emoji: '🔊' },
            Cameras: { text: 'Kamera Sıralama', emoji: '📷' },
            Streams: { text: 'Yayın Sıralama', emoji: '📺' },
            Records: { text: 'Kayıt Sıralama', emoji: '📋' },
            Invites: { text: 'Davet Sıralama', emoji: '✉️' },
            Inventory: { text: 'Para Sıralama', emoji: '💸' },
            Auths: { text: 'Yetkili Sıralama', emoji: '🔑' },
        }

        if (message.guild.settings.public) {
            titlesAndKeys.Taggeds = { text: 'Taglı Sıralama', emoji: '🏷️' }
        };

        const row = new ActionRowBuilder({
            components: [
                new StringSelectMenuBuilder({
                    custom_id: 'type',
                    placeholder: 'Sıralama kategorisini seç!',
                    options: Object.keys(titlesAndKeys).map((k) => ({
                        label: titlesAndKeys[k].text,
                        value: k,
                        emoji: titlesAndKeys[k].emoji
                    }))
                })
            ]
        })

        const msg = await message.reply({ components: [row] });
        var filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async i => {
            await i.deferUpdate();
            await getTop(client, msg, i.values[0], message.member, message);
        });
    },
};

async function getTop(client, msg, type, member, message) {

    const guildMembers = message.guild.members.cache.map(member => member.user.id);

    const totalData = type === 'Invites' ? Math.ceil(await User.find({ userID: { $in: guildMembers }, NormalInvites: { $gt: 0 } }).countDocuments() / 10) :
                      type === 'Inventory' ? Math.ceil(await User.find({ userID: { $in: guildMembers }, 'Inventory.Cash': { $gt: 0 } }).countDocuments() / 10) :
                      type === 'Taggeds' ? Math.ceil(await User.find({ userID: { $in: guildMembers }, Taggeds: { $exists: true, $ne: [] } }).countDocuments() / 10) :
                      type === 'Auths' ? Math.ceil(await User.find({ userID: { $in: guildMembers }, Auths: { $exists: true, $ne: [] } }).countDocuments() / 10) :
                      Math.ceil(await User.find({ userID: { $in: guildMembers }, [type]: { $exists: true, $ne: {} } }).countDocuments() / 10);

    let totalQuery;
    if (type === 'Records') {
        totalQuery = { $cond: { if: { $isArray: '$Records' }, then: { $size: '$Records' }, else: 0 } };
    } else if (type === 'Invites') {
        totalQuery = '$NormalInvites';
    } else if (type === 'Inventory') {
        totalQuery = '$Inventory.Cash';
    } else if (type === 'Taggeds') {
        totalQuery = { $cond: { if: { $isArray: '$Taggeds' }, then: { $size: '$Taggeds' }, else: 0 } };
    } else if (type === 'Auths') {
        totalQuery = { $cond: { if: { $isArray: '$Auths' }, then: { $size: '$Auths' }, else: 0 } };
    } else {
        totalQuery = {
            $reduce: {
                input: { $objectToArray: `$${type}` },
                initialValue: 0,
                in: { $add: ['$$value', '$$this.v.total'] }
            }
        };
    }

    const data = await User.aggregate([
        { $project: { userID: '$userID', total: totalQuery } },
        { $match: { userID: { $in: guildMembers }, total: { $gt: 0 } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
        { $project: { userID: 1, total: 1 } },
    ]);


    if (totalData === 0 || (totalData === 1 && data.length === 0)) {
        await msg.edit({ components: [], embeds: [createTopEmbed(client, type, [], message, 1, 1)] });
        return;
    }

    let Page = 1;
    await msg.edit({ components: [client.getButton(Page, totalData)], embeds: [createTopEmbed(client, type, data, message, Page)] });
    const filter = (i) => i.user.id === member.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000, max: 20 });

    collector.on('collect', async (i) => {

        i.deferUpdate();
        if (i.customId === 'first') Page = 1;
        if (i.customId === 'previous') Page -= 1;
        if (i.customId === 'next') Page += 1;
        if (i.customId === 'last') Page = totalData

        const newData = await User.aggregate([
            { $project: { userID: '$userID', total: totalQuery } },
            { $match: { userID: { $in: guildMembers }, total: { $gt: 0 } } },
            { $sort: { total: -1 } },
            { $skip: (Page - 1) * 10 },
            { $limit: 10 },
            { $project: { userID: 1, total: 1 } },
        ]);

        if (newData.length === 0) {
            await msg.edit({ components: [], embeds: [createTopEmbed(client, type, newData, message, Page)] });
            return;
        }

        await msg.edit({ components: [client.getButton(Page, totalData)], embeds: [createTopEmbed(client, type, newData, message, Page)] });
    });
}

function createTopEmbed(client, type, data, message, page) {
    let content = "";

    if (data.length === 0) {
        content = "Bu sayfada veri bulunmamaktadır.";
    } else {
        content = data.map((x, i) => {
            const rank = (page - 1) * 10 + i + 1;
            const member = message.guild.members.cache.get(x.userID) || `<@${x.userID}>`;
            const total = type === 'Messages' ? `${x.total} mesaj` :
                          type === 'Invites' ? `${x.total} davet` :
                          type === 'Records' ? `${x.total} kayıt` :
                          type === 'Taggeds' ? `${x.total} taglı` :
                        type === 'Auths' ? `${x.total} yetkili` :
                          ['Voices', 'Streams', 'Cameras'].includes(type) ? `${formatDurations(x.total)}` :
                          `${numberWithCommas(x.total)}$`;
            const isAuthor = message.author.id === x.userID ? ' **(Siz)**' : '';
            return `\`${rank}.\` ${member} • ${total} ${isAuthor}`;
        }).join('\n');
    }

    const embed = new EmbedBuilder({
        color: client.random(),
        author: { name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) },
        thumbnail: { url: message.guild.iconURL({ dynamic: true }) },
        description: `Aşağıda genel **${type === 'Messages' ? 'mesaj' : type === 'Invites' ? 'davet' : type === 'Records' ? 'kayıt' : type === 'Taggeds' ? 'taglı' : type === 'Auths' ? 'yetkili' : type === 'Voices' ? 'ses' : type === 'Streams' ? 'yayın' : type === 'Cameras' ? 'kamera' : 'para'}** sıralaması bulunmaktadır.\n\n${content}`
    })
    
    return embed;
}

function formatDurations(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let timeString = "";

    if (hours > 0) {
        const minutes2 = minutes % 60;
        timeString += hours + "," + (minutes2 < 10 ? "0" : "") + minutes2 + " saat";
    } else if (minutes > 0) {
        const seconds2 = seconds % 60;
        timeString += minutes + "," + (seconds2 < 10 ? "0" : "") + seconds2 + " dakika";
    } else {
        timeString += seconds + " saniye";
    }

    return timeString.trim();
}

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}