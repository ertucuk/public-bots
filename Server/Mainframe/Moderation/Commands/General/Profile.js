const { PermissionsBitField: { Flags }, EmbedBuilder, ActivityType } = require('discord.js')
const { User } = require('../../../../Global/Settings/Schemas')
const { ClassicPro, Classic, Mini, Dynamic } = require("musicard");
const moment = require('moment');
moment.locale('tr');

module.exports = {
    Name: 'profil',
    Aliases: ['kb'],
    Description: 'Belirttiğiniz kişinin profil bilgilerini görürsünüz.',
    Usage: 'profil <@kullanıcı/ID>',
    Category: 'General',
    Cooldown: 0,
    Command: { Prefix: true },

    messageRun: async (client, message, args) => {
        const user = (await client.getUser(args[0])) || (message.reference ? (await message.fetchReference()).author : await message.author.fetch())
        const member = message.guild.members.cache.get(user.id)
        const platform = { web: '`İnternet Tarayıcısı` ` 🌍 `', desktop: '`PC (Bilgisiyar)` ` 💻 `', mobile: '`Mobil` ` 📱 `' }
        const document = await User.findOne({ userID: user.id })
        const marriedUser = await client.getUser(document.Marriage.married)
        const embed = new EmbedBuilder({
            color: client.random(),
            thumbnail: { url: user.displayAvatarURL({ forceStatic: true }) },
            author: { name: message.author.username, iconURL: message.author.displayAvatarURL({ forceStatic: true }) },
            fields: [
                {
                    name: `**Kullanıcı Bilgisi**`,
                    value: [
                        `**\` • \`** Profil: ${user}`,
                        `**\` • \`** ID: **${user.id}**`,
                        `**\` • \`** Oluşturma Tarihi: ${client.timestamp(user.createdAt)}`,
                        `**\` • \`** Bağlandığı Cihaz: ${member.presence && member.presence.status !== 'offline'
                            ? `${platform[Object.keys(member.presence.clientStatus)[0]]}`
                            : `\`Cevrimdışı\` \` 🔴 \``
                        }`,
                        `${document?.Marriage && document?.Marriage.active === true
                            ? `**\` • \`** Evlilik Durumu: ${marriedUser ? `<@${marriedUser.id}>` : `\`Bulunmuyor\``}`
                            : ``
                        }`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: `**Sunucu Bilgisi**`,
                    value: [
                        `**\` • \`** İsmi: **${member.displayName}**`,
                        `${document && document.Registrant && message.guild.members.cache.has(document.Registrant)
                            ? `**\` • \`** Teyit Sorumlusu: <@${document.Registrant}>`
                            : `**\` • \`** Teyit Sorumlusu: \` Bulunmuyor \``
                        }`,
                        `${document && document.UserInviter && message.guild.members.cache.has(document.UserInviter)
                            ? `**\` • \`** Davet Eden: <@${document.UserInviter}>`
                            : `**\` • \`** Davet Eden: \` Bulunmuyor \``
                        }`,
                        `**\` • \`** Katılma Tarihi: ${client.timestamp(member.joinedAt)}`,
                        `**\` • \`** Katılma sırası: **${member.guild.members.cache.filter((m) => m.joinedTimestamp <= member.joinedTimestamp).size
                        }/${member.guild.memberCount}**`,
                        `**\` • \`** Sunucudaki Rolleri: **(**\`${member.roles.cache.size - 1}\`**)**\n**\` ➥ \`** ${member.roles.cache.size > 1
                            ? member.roles.cache
                                .filter((r) => r.name !== '@everyone')
                                .sort((a, b) => b.position - a.position)
                                .map((r) => r)
                                .listArray()
                            : `\` Bulunmuyor \``
                        }`
                    ].join('\n'),
                    inline: false
                }
            ]
        })

        if (member.presence && member.presence.activities && member.presence.activities.some((activity) => activity.name == 'Spotify' && activity.type == ActivityType.Listening)) {
            let status = await member.presence.activities.find((activity) => activity.type == ActivityType.Listening)
            const sex = new Date(status.timestamps.end).getTime() - new Date(status.timestamps.start).getTime();
            const gecensüre = new Date(Date.now()).getTime() - new Date(status.timestamps.start).getTime();
            const progress = (gecensüre / sex) * 100;
            const spotifyCard = await Classic({
                thumbnailImage: `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`,
                backgroundColor: "#070707",
                progress: progress,
                progressColor: "#ffffff",
                progressBarColor: "#201d1d",
                name: status.details,
                nameColor: "#ffffff",
                author: status.state,
                authorColor: "#696969",
                startTime: sureCevir(new Date(Date.now()).getTime() - new Date(status.timestamps.start).getTime()),
                endTime: sureCevir(new Date(status.timestamps.end).getTime() - new Date(status.timestamps.start).getTime(), true),
                timeColor: "#ffffff"
            });

            embed.setImage(`attachment://spotify.png`)
            return message
                .reply({ embeds: [embed], files: [{ name: 'spotify.png', attachment: spotifyCard }] })
                .then((msg) => setTimeout(() => msg.delete(), 10000))
        } else {
            const bannerURL = await user.bannerURL({ format: 'png', size: 4096 })
            embed.setImage(bannerURL ? bannerURL : null)

            return message.reply({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 30000))
        }
    },
}

function sureCevir(veri, isEndTime = false) {
    if (isEndTime) {
        return moment.utc(veri).format("m:ss");
    } else {
        return moment.utc(veri).format("mm:ss");
    }
}