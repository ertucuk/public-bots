const { GuildMember, User, ChannelType, EmbedBuilder, bold, time, Embed, Colors, codeBlock, ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode } = require('discord.js');
const axios = require('axios');
const Users = require("../../Settings/Schemas/Global/User")
const System = require("../../Settings/System");
const { Servers, Punitive, ForceBan, Jail, Mute, VoiceMute, Ads, Staff, PunitiveNo } = require('../../Settings/Schemas');
const Staffs = require('../../Base/Staff');
const moment = global.moment = require('moment');
require("moment-duration-format");
const ms = require('ms');

const titles = {
    ['Male']: 'Erkek',
    ['Girl']: 'Kadın',
    ['Unregister']: 'Kayıtsız',
    ['ChangeNickname']: 'İsim Değiştirme',
    ['AutoRegister']: 'Otomatik Kayıt',
    ['Quit']: 'Sunucudan Ayrılma',
    ['Gender']: 'Cinsiyet Değiştirme'
}

module.exports = Object.defineProperties(GuildMember.prototype, {
    bannerURL: {
        value: async function ({ format = 'png', size = 1024, dynamic } = {}) {
            if (format && !['png', 'jpeg', 'webp', 'gif'].includes(format)) throw new SyntaxError('Please specify an available format.');
            if (size && ![512, 1024, 2048, 4096].includes(parseInt(size) || isNaN(parseInt(size)))) throw new SyntaxError('Please specify an avaible size.');
            if (dynamic && typeof dynamic !== 'boolean') throw new SyntaxError('Dynamic option must be Boolean.')

            const response = await axios.get(`https://discord.com/api/v10/users/${this.id}`, { headers: { 'Authorization': `Bot ${client.token}` } });
            if (!response.data.banner) return `${response.data.banner_color !== null ? `https://singlecolorimage.com/get//${response.data.banner_color.replace('#', '')}/512x254` : `https://vante.dev/img/512x254.png`}`
            if (format == 'gif' || dynamic == true && response.data.banner.startsWith('a_')) return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.gif${parseInt(size) ? `?size=${parseInt(size)}` : ''}`
            else return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.${format}${parseInt(size) ? `?size=${parseInt(size)}` : ''}`
        }
    },

    setRoles: {
        value: function (roles) {
            if (!this.manageable) return;
            const newRoles = this.roles.cache.filter(x => x.managed).map(x => x.id).concat(roles);
            return this.roles.set(newRoles).catch(() => { });
        }
    },

    Register: {
        value: async function (Name, Gender = undefined, Registrant = undefined, Msg = undefined) {
            if (Gender == 'Male') Msg.components[0].components[0].data.style = ButtonStyle.Success;
            else Msg.components[0].components[1].data.style = ButtonStyle.Success;
            Msg?.components[0].components.pop();
            Msg?.components.forEach((x) => x.components.forEach((x) => (x.data).disabled = true));
            Msg.edit({
                embeds: [
                    new EmbedBuilder({
                        description: `${this} üyesinin ismi ${bold(Name)} olarak değiştirildi.\n\n**${Gender === "Male" ? "ERKEK" : "KADIN"}** olarak kayıt edildi!`
                    })
                ],
                components: Msg.components
            });            
            let Server = await Servers.findOne({ serverID: this.guild.id });
            let roles = Gender == "Male" ? Server.manRoles : Server.womanRoles;
            await this.setRoles(roles);

            if (this.guild.settings.public) {
                this.setNickname(`${this.user.displayName.includes(this.guild.settings.serverTag) ? `${this.guild.settings.serverTag}` : (this.guild.settings.secondTag || "")} ${Name}`).catch(err => Msg.channel.send(global.cevaplar.isimapi));
            } else {
                this.setNickname(`${this.guild.settings.secondTag} ${Name}`).catch(err => Msg.channel.send(global.cevaplar.isimapi));
            }

            const VoiceChannel = Registrant.guild.channels.cache.filter(x => x.parentId == Server.publicParent && x.type == ChannelType.GuildVoice && !Server.afkChannel.includes(x.id)).random();
            const ChatChannel = Registrant.guild.channels.cache.get(Server.chatChannel);
    
            if (this.voice && this.voice.channel) {
                setTimeout(() => {
                    this.send({ content: `**${System ? System.serverName : this.guild.name} Sunucusuna Hoşgeldin!** Kayıt işlemin tamamlandı ve şimdi aramıza katıldın. Teyit odasında bulunduğum için **Bot**, seni otomatik olarak **${VoiceChannel.name}** odasına taşıdı.\n\nKeyifli sohbetler dilerim! 🎉🎉🎉` }).catch(err => { });
                    this.voice.setChannel(VoiceChannel).catch(err => { });
                }, 5000);
            }
    
            if (ChatChannel) {
                let welcomeMessage = `:tada: ${this} ailemize katıldı! Ailemize hoş geldin, İyi Eğlenceler.`;
                if (Server.public && !this.user.displayName.includes(Server.serverTag)) {
                    welcomeMessage = `:tada: ${this} ailemize katıldı! Ailemize hoş geldin! Sen de bizden biri olmak ister misin? ${System ? System.serverName : this.guild.name} tagı (\`${Server.serverTag}\`) alabilirsin. İyi eğlenceler dileriz!`;
                }
                ChatChannel.send(welcomeMessage).then(x => { setTimeout(() => { x.delete() }, 15000) });
            }
    
            await Users.updateOne({ userID: this.id }, { $set: { "userName": Name, "Gender": Gender, "Registrant": Registrant.id }, $push: { "Names": { Staff: Registrant.id, Name: Name, Type: Gender, Role: roles.join(","), Date: Date.now() } } }, { upsert: true });
            await Users.updateOne({ userID: Registrant.id }, { $push: { "Records": { User: this.id, Gender: Gender, Date: Date.now() } } }, { upsert: true });
    
            const RegisterLog = this.guild.channels.cache.find(x => x.name === "register-log");
            if (RegisterLog) RegisterLog.send({ embeds: [new global.VanteEmbed().setTimestamp().setDescription(`${this} isimli üye ${Registrant} yetkilisi tarafından <t:${Math.floor(Date.now() / 1000)}> **${Gender === "Male" ? "Erkek" : "Kadın"}** olarak kayıt edildi.`)] });

            const document = await Staff.findOne({ id: Registrant.id });
            if (document) {
                if (Server.maxStaffs.some(r => Registrant.roles.cache.has(r))) {
                    if (!document?.tasks?.some(x => x.type == 'REGISTER')) return;
                    await Staffs.checkTasks({ document, count: 1, spesificType: 'REGISTER' });
                    await Staffs.checkRole(Registrant, document, 'rank');
                } else {
                    await Staffs.addPoint(Registrant, 'register');
                    await Staffs.checkRole(Registrant, document, 'rank');
                }
                await document.save();
            }
        }
    },

    Rename: {
        value: async function (Name, Registrant = undefined, Reason = undefined, Channel = undefined) {
            await Users.updateOne({ userID: this.id }, { $set: { "userName": Name }, $push: { "Names": { Staff: Registrant.id, Name: Name, Type: "ChangeNickname", Reason: Reason, Date: Date.now() } } }, { upsert: true })

            if (this.guild.settings.public) {
                this.setNickname(`${this.user.displayName.includes(this.guild.settings.serverTag) ? `${this.guild.settings.serverTag}` : (this.guild.settings.secondTag || "")} ${Name}`).catch(err => Channel.send(global.cevaplar.isimapi));
            } else {
                this.setNickname(`${this.guild.settings.secondTag} ${Name}`).catch(err => Channel.send(global.cevaplar.isimapi));
            }

            const RegisterLog = this.guild.channels.cache.find(x => x.name === "register-log");
            const document = await Users.findOne({ userID: this.id });
            if (!RegisterLog) return console.log("Register Log bulunmuyor.")
            if (RegisterLog) RegisterLog.send({ embeds: [new EmbedBuilder().setDescription(`${this} isimli üyenin ismi ${Registrant} yetkilisi tarafından <t:${Math.floor(Date.now() / 1000)}>  **${Name}** olarak yeniden adlandırıldı.`)] })

            const embed = new EmbedBuilder({
                color: client.random(),
                author: {
                    name: Registrant.username,
                    icon_url: Registrant.displayAvatarURL({ forceStatic: true })
                },
                description:
                    document.Names.length > 0
                        ? [
                            `**${this}** adlı üyenin ismi "${bold(`${Name}`)}" olarak değiştirildi, bu üye daha önce bu isimlerle kayıt olmuş.\n`,
                            `Kişinin toplamda ${bold(document.Names.length.toString())} isim kayıtı bulundu.`,
                            `${document.Names
                                .slice(
                                    document.Names.length ? document.Names.length - 10 : 0,
                                    document.Names.length ? document.Names.length : 10
                                )
                                .map(
                                    (n) =>
                                        `- ${time(Math.floor(n.Date / 1000), 'D')}: ${n.Name ? n.Name : undefined} - ${bold(`${titles[n.Type]}`)}`
                                )
                                .join('\n')}\n`
                        ].join('\n')
                        : `${this} kişisinin ismi "${bold(`${Name}`)}" olarak değiştirildi.`
            })

            Channel.send({ embeds: [embed] }).then(s => setTimeout(() => s.delete().catch(err => { }), 15000));
        }
    },

    Unregister: {
        value: async function (Registrant = undefined, Reason = undefined, Channel = undefined) {
            Channel.send({ content: `${client.getEmoji("check")} ${this} adlı üye başarıyla ${Registrant} tarafından kayıtsıza atıldı.` });
            this.send({ content: `${this.guild.name} sunucusunda ${Registrant} tarafından kayıtsıza atıldınız.` }).catch(err => { });

            if (this.voice.channel) this.voice.disconnect()
            if (this.guild.settings.public) {
                await this.setNickname(`${this.user.displayName.includes(this.guild.settings.serverTag) ? `${this.guild.settings.serverTag}` : (this.guild.settings.secondTag || "")} İsim | Yaş`).catch(err => { })
            } else {
                await this.setNickname(`${this.guild.settings.secondTag} İsim | Yaş`).catch(err => { })
            }
            
            this.setRoles(this.guild.settings.unregisterRoles).catch();

            const UserData = await Users.findOne({ userID: this.id });
            if (UserData && UserData.userName) await Users.updateOne({ userID: this.id }, { $set: { "Gender": "Unregister" }, $push: { "Names": { Staff: Registrant.id, Date: Date.now(), Name: UserData.userName, Type: "Unregister", Reason: Reason } } }, { upsert: true })

            const RegisterLog = this.guild.channels.cache.find(x => x.name === "register-log");
            if (!RegisterLog) return console.log("Register Log bulunmuyor.")
            if (RegisterLog) RegisterLog.send({ embeds: [new global.VanteEmbed().setTimestamp().setDescription(`${this} adlı üye ${Registrant} tarafından kayıtsıza atıldı.`)] });
        }
    },

    Punitive: {
        value: async function (author, Type, reason = "Sebep belirtilmedi.", channel, duration, msg, image) {
            const punitiveNo = await PunitiveNo.findOneAndUpdate({}, { $inc: { No: 1 } }, { upsert: true, new: true });
            const typeMap = {
                "FORCE-BAN": "Kalkmaz Yasaklama",
                "BAN": "Yasaklama",
                "JAIL": "Cezalandırılma",
                "ADS": "Reklam",
                "CHAT-MUTE": "Metin Susturulma",
                "VOICE-MUTE": "Ses Susturulma",
                "UNDERWORLD": "Underworld",
                "WARN": "Uyarılma",
                "ET": "Etkinlik Ceza",
                "ST": "Streamer Ceza"
            };
            Type = typeMap[Type] || Type;
    
            const ceza = new Punitive({
                No: punitiveNo.No,
                Member: this.id,
                Staff: author.id,
                Type: Type,
                Reason: reason,
                Duration: duration ? Date.now() + ms(duration) : undefined,
                Image: image,
                Date: Date.now()
            });

            await ceza.save().catch();
    
            const logChannels = {
                "Kalkmaz Yasaklama": "ban-log",
                "Yasaklama": "ban-log",
                "Underworld": "underworld-log",
                "Cezalandırılma": "jail-log",
                "Reklam": "ads-log",
                "Ses Susturulma": "vmute-log",
                "Metin Susturulma": "mute-log",
                "Uyarılma": "warn-log",
                "Etkinlik Ceza": "et-ceza-log",
                "Streamer Ceza": "st-ceza-log"
            }[Type];
    
            const logChannel = this.guild.channels.cache.find(x => x.name === logChannels);
            const punishMessage = `# Bilgilendirilme\n→ Kullanıcı: ${this.user.username}\n→ Sebep: ${reason}\n→ Yetkili: ${author.user.username} (${author.id})\n→ Tarih: ${moment(ceza.Date).format('DD.MM.YYYY HH:mm')}\n→ Süre: ${duration ? `${moment.duration(ms(duration)).format('Y [Yıl,] M [Ay,] d [Gün,] h [Saat,] m [Dakika]')}` : 'Sınırsız'}`;
            if (logChannel) {
                logChannel.send({
                    embeds: [new EmbedBuilder({
                        title: `${Type}`,
                        color: client.random(),
                        image: image ? { url: image.attachment } : undefined,
                        description: `${this} adlı üye ${Type} cezası aldı. (#${ceza.No})\n${codeBlock('md', punishMessage)}`
                    })]
                });
            }
    
            if (msg) msg.delete().catch();
            if (channel) await channel.send({
                content: `${this.toString()} kullanıcısı ${author} tarafından ${bold(reason)} sebebiyle ${Type === 'Yasaklama' ? 'sunucudan yasaklandı' : Type === 'Kalkmaz Yasaklama' ? 'kalkmaz yasaklandı' : Type === 'Cezalandırılma' ? 'cezalıya gönderildi' : Type === 'Reklam' ? 'reklam cezası aldı' : Type === 'Ses Susturulma' ? 'sesli kanallarda susturuldu' : Type === 'Metin Susturulma' ? 'metin kanallarında susturuldu' : Type === 'Underworld' ? 'cezalıya gönderildi' : Type === 'Uyarılma' ? 'uyarıldı' : Type === 'Etkinlik Ceza' ? 'etkinlik cezası aldı' : Type === 'Streamer Ceza' ? 'streamer cezası aldı' : 'ceza aldı'}.`,
            })
    
            const actions = {
                "Kalkmaz Yasaklama": async () => {
                    await this.guild.members.ban(this.id, { reason: `Yetkili: ${author.user.tag} | Sebep: ${reason} | Ceza Numarası: #${ceza.No}` });
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Forceban": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 45 } });
                    new ForceBan({ ID: this.id, No: ceza.No }).save().catch();
                },
                "Yasaklama": async () => {
                    await this.guild.members.ban(this.id, { reason: `Yetkili: ${author.user.tag} | Sebep: ${reason} | Ceza Numarası: #${ceza.No}` });
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Ban": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 30 } });
                },
                "Cezalandırılma": async () => {
                    await this.voice.disconnect().catch();
                    if (this.manageable) await this.setRoles(this.guild.settings.quarantineRole);
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Jail": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 20 } });
                    new Jail({ ID: this.id, No: ceza.No, Duration: Date.now() + ms(duration) }).save().catch();
                },
                "Reklam": async () => {
                    await this.voice.disconnect().catch();
                    if (this.manageable) await this.setRoles(this.guild.settings.adsRole);
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Ads": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 20 } });
                    new Ads({ ID: this.id, No: ceza.No }).save().catch();
                },
                "Ses Susturulma": async () => {
                    if (this.voice.channel) await this.voice.setMute(true);
                    if (this.manageable) await this.roles.add(this.guild.settings.voiceMuteRole);
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.VoiceMute": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 10 } });
                    new VoiceMute({ ID: this.id, No: ceza.No, Duration: Date.now() + ms(duration) }).save().catch();
                },
                "Metin Susturulma": async () => {
                    if (this.manageable) await this.roles.add(this.guild.settings.chatMuteRole);
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Mutes": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 10 } });
                    new Mute({ ID: this.id, No: ceza.No, Duration: Date.now() + ms(duration) }).save().catch();
                },
                "Underworld": async () => {
                    await this.voice.disconnect().catch();
                    if (this.manageable) await this.setRoles(this.guild.settings.underworldRole);
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Underworld": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 20 } });
                },
                "Uyarılma": async () => {
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Warns": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 5 } });
                },
                "Etkinlik Ceza": async () => {
                    if (this.manageable) await this.roles.add(this.guild.settings.etRole);
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.Et": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 10 } });
                },
                "Streamer Ceza": async () => {
                    if (this.manageable) await this.roles.add(this.guild.settings.stRole);
                    await Users.updateOne({ userID: author.id }, { $inc: { "Uses.St": 1 } });
                    await Users.updateOne({ userID: this.id }, { $inc: { PenalPoints: 10 } });
                }
            };
    
            if (actions[Type]) await actions[Type]();

            const userDocument = await Users.findOne({ userID: this.id })
            if (!userDocument) return;

            const punitiveLog = this.guild.channels.cache.find(x => x.name === "ceza-işlem");

            if (punitiveLog) {
                punitiveLog.send({
                    content: `${inlineCode(' • ')} ${this} üyesi ${author} tarafından ${Type} cezası aldı. (#${ceza.No})\n${inlineCode(' • ')} Üyenin güncel ceza puanı: ${userDocument?.PenalPoints}`
                })
            }

            await this.send({
                embeds: [ new EmbedBuilder({
                    image: image ? { url: image.attachment } : undefined,
                    title: 'Cezalandırıldınız!',
                    color: Colors.Red,
                    description: `Sunucumuzda ${Type} cezası aldınız. (#${ceza.No})\n${codeBlock('md', punishMessage)}`
                })]
            }).catch(err => { });
        }
    },
});

module.exports = Object.defineProperties(User.prototype, {
    bannerURL: {
        value: async function ({ format = 'png', size = 1024, dynamic } = {}) {
            if (format && !['png', 'jpeg', 'webp', 'gif'].includes(format)) throw new SyntaxError('Please specify an available format.');
            if (size && ![512, 1024, 2048, 4096].includes(parseInt(size) || isNaN(parseInt(size)))) throw new SyntaxError('Please specify an avaible size.');
            if (dynamic && typeof dynamic !== 'boolean') throw new SyntaxError('Dynamic option must be Boolean.')

            const response = await axios.get(`https://discord.com/api/v10/users/${this.id}`, { headers: { 'Authorization': `Bot ${client.token}` } });
            if (!response.data.banner) return `${response.data.banner_color !== null ? `https://singlecolorimage.com/get//${response.data.banner_color.replace('#', '')}/512x254` : `https://vante.dev/img/512x254.png`}`
            if (format == 'gif' || dynamic == true && response.data.banner.startsWith('a_')) return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.gif${parseInt(size) ? `?size=${parseInt(size)}` : ''}`
            else return `https://cdn.discordapp.com/banners/${response.data.id}/${response.data.banner}.${format}${parseInt(size) ? `?size=${parseInt(size)}` : ''}`
        }
    },
});