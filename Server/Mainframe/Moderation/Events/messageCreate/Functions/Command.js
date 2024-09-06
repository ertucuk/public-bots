const { Commands: { MessageCommandsHandler } } = require("../../../../../Global/Handlers");
const { Servers } = require("../../../../../Global/Settings/Schemas");

module.exports = async function commandHandler(client, message) {
    if (message.author.bot) return;

    const data = await Servers.findOne({ serverID: message.guild.id });

    if (data.unregisterRoles.some(x => message.member.roles.cache.has(x)) || data.quarantineRole.split(",").some(x => message.member.roles.cache.has(x)) || data.underworldRole.split(",").some(x => message.member.roles.cache.has(x))) return;
    
    if (client.Vante.Commands) {
        await MessageCommandsHandler(client, message);
        return;
    };
}