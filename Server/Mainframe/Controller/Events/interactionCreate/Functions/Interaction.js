const { Events } = require("discord.js");
const { Commands: { ContextCommandsHandler, SlashCommandsHandler } } = require("../../../../../Global/Handlers");
const Button = require("../Handler/Button");

module.exports = async function InteractionHandler(client, interaction) {

    if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) {
        return await ContextCommandsHandler(client, interaction);
    }

    if (interaction.isButton()) return Button.run(client, interaction);
    if (interaction.isCommand()) {
        return await SlashCommandsHandler(client, interaction);
    }
}
