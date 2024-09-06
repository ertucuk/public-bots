const { User, Servers } = require("../../../../../Global/Settings/Schemas/");
const System = require("../../../../../Global/Settings/System");

module.exports = async function bannedTagHandler(client, oldUser, user) {

    const ServerData = await Servers.findOne({ serverID: client.system.serverID });
    if (!ServerData) return;

    const UserData = await User.findOne({ userID: user.id });

    if ((ServerData.bannedTags && ServerData.bannedTags.some(bannedtag => user.user.globalName.includes(bannedtag))) && (ServerData.bannedTagRole && !user.roles.cache.has(ServerData.bannedTagRole))) {
        user.setRoles(ServerData.bannedTagRole).catch();
        user.send({ content: `**Merhaba** ${user}\n\nBu yazı, sunucumuz içerisindeki kurallarımıza uymadığı tespit edilen bir sembolün, sizin hesabınızda tespit edildiğini bildirmek amacıyla yazılmıştır. Üzerinizde bulunan (\`${ServerData.bannedTags.find(x => user.user.globalName.includes(x))}\`) sembolü sunucumuz kurallarına aykırı olduğu için hesabınız yasaklı kategorisine eklenmiştir.\n\nBu durumun düzeltilmesi için, yasaklı sembolü kaldırmanız gerekmektedir. Söz konusu yasaklı sembol hesabınızdan çıkarıldığında, eğer daha önce kayıtlıysanız otomatik olarak kayıtlı duruma geçeceksiniz. Ancak, eğer kayıtlı değilseniz, tekrar kayıtsıza düşeceksiniz.\n\nHerhangi bir sorunuz veya açıklamanız için moderatör ekibimizle iletişime geçebilirsiniz.\n\nSaygılarımla,\n**${user.guild.name} Moderasyon Ekibi**` }).catch()
        let bannedTagChannel = await client.getChannel("bannedtag-log", user)
        if (bannedTagChannel) bannedTagChannel.send({ embeds: [new client.VanteEmbed().setDescription(`${user} (${user.username} - ${user.id}) adlı üye ismine <t:${Math.floor(Date.now() / 1000)}:R> yasaklı tag aldığı için jaile atıldı.`)] })
        return;
    };

    if ((ServerData.bannedTags && !ServerData.bannedTags.some(bannedtag => user.user.globalName.includes(bannedtag))) && (ServerData.bannedTagRole && user.roles.cache.has(ServerData.bannedTagRole))) {
        user.send({ content: `**${user.guild.name}** sunucumuzun yasaklı taglarından birine sahip olduğun için cezalıydın. Ancak, şimdi bu yasaklı tagı çıkardığın için cezalıdan çıkarıldın!` }).catch();
        let bannedTagChannel = await client.getChannel("bannedtag-log", user)
        if (bannedTagChannel) bannedTagChannel.send({ embeds: [new client.VanteEmbed().setDescription(`${user} (${user.username} - ${user.id}) adlı üye ismine <t:${Math.floor(Date.now() / 1000)}:R> yasaklı tagı çıkarttığı için cezalıdan çıkartıldı!`)] })
        if (!ServerData.taggedMode && UserData && UserData.userName && UserData.Names && UserData.Gender) {
            if (user && user.manageable) await user.setNickname(`${user.user.displayName.includes(ServerData.serverTag) ? ServerData.serverTag : (ServerData.secondTag || "")} ${UserData.userName}`)
            if (UserData.Gender == "Male") await user.setRoles(ServerData.manRoles).catch();
            if (UserData.Gender == "Girl") await user.setRoles(ServerData.womanRoles).catch();
            if (UserData.Gender == "Unregister") await user.setRoles(ServerData.unregisterRoles).catch();
        } else {
            user.setRoles(ServerData.unregisterRoles).catch();
            if (user && user.manageable) await user.setNickname(`${user.user.displayName.includes(ServerData.serverTag) ? ServerData.serverTag : (ServerData.secondTag || "")} İsim | Yaş`)
        }
    };
} 