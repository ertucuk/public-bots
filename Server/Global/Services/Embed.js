const { EmbedBuilder } = require('discord.js');
/**
 * VanteEmbed - An embed builder with a custom color and timestamp
 * @extends {EmbedBuilder}
*/
class VanteEmbed extends EmbedBuilder {
	constructor(guild = null, data = {}) {
		super(data);
		this.guild = guild;

		if (this.guild) {
			this.setFooter({ text: guild.name + ' | ' + `Created By Ertu`, iconURL: guild.iconURL({ dynamic: true, size: 2048 }) })
			this.setColor("Random")
		} else {
			this.setColor("Random")
		}
	}
}

module.exports = VanteEmbed;