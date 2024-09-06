const { Guild, PermissionsBitField, VoiceState, ChannelType, inlineCode, PermissionFlagsBits } = require("discord.js")
const Emojis = require("../../Settings/Server/Emojis.json");
const { Servers, rolePermissions } = require('../../Settings/Schemas/');

module.exports = Object.defineProperties(Guild.prototype, {
	fetchSettings: {
		value: async function () {
			return this.settings = await Servers.findOneAndUpdate(
				{ serverID: this.id },
				{},
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			); 
		},
	},

	set: {
		value: async function (settings) {
			try {
				logger.log(`Guild: [${this.id}] updated settings: ${Object.keys(settings)}`);
				if (Object.keys(this.settings).length > 0) {
					await Servers.findOneAndUpdate({ serverID: this.id }, { $set: settings });
				} else {
					const newGuild = new Servers(Object.assign({ serverID: this.id }, { $set: settings }));
					await newGuild.save();
				}

				return this.fetchSettings();
			} catch (error) {
				logger.error(`Failed to update settings for Guild: [${this.id}]. Error: ${error}`);
			};
		}
	},

	updateSettings: {
		value: async function (settings) {
			try {
				logger.log(`Guild: [${this.id}] updated settings: ${Object.keys(settings)}`);
				if (this.settings.serverID) {
					await Servers.findOneAndUpdate({ serverID: this.id }, settings);
				} else {
					const newGuild = new Servers(Object.assign({ serverID: this.id }, settings));
					await newGuild.save();
				}

				return this.fetchSettings();
			} catch (error) {
				logger.error(`Failed to update settings for Guild: [${this.id}]. Error: ${error}`);
			}
		}
	},

	deleteDB: {
		value: async function () {
			return await Servers.deleteOne({ serverID: this.id });
		},
	},


	settings: {
		value: {},
		writable: true
	},

	stats: {
		value: [],
		writable: true,
	},
});