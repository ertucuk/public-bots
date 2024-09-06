const { TextChannel, VoiceChannel, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection} = require('@discordjs/voice');

module.exports = Object.defineProperties(TextChannel.prototype, {
    wsend: {
        value: async function(message) {
            const hooks = await this.fetchWebhooks();
            let webhook = hooks.find(a => a.name === client.user.username && a.owner.id === client.user.id);
            if (webhook) return webhook.send(message);
            webhook = await this.createWebhook({ name: client.user.username, avatar: client.user.avatarURL() });
            return webhook.send(message);
        }
    }
});
 
module.exports = Object.defineProperties(VoiceChannel.prototype, {
	join: {
		value: function({selfDeaf = false, selfMute = false, Interval = false} = {}) {
			if (this.type !== ChannelType.GuildVoice) {
				this.client.logger.error('the specified channel is not an audio channel!')
				return;
			}

			const connection = getVoiceConnection(this.guild.id)
			if (connection) return;

            joinVoiceChannel({
				channelId: this.id,
				guildId: this.guild.id,
				adapterCreator: this.guild.voiceAdapterCreator,
				group: client.user.id,
				selfDeaf: selfDeaf,
				selfMute: selfMute
			})
			
			if (Interval) {
				setInterval(async () => {
					const VoiceChannel = client.channels.cache.get(this.id);
					if (VoiceChannel) { 
						joinVoiceChannel({
							channelId: this.id,
							guildId: this.guild.id,
							adapterCreator: this.guild.voiceAdapterCreator,
							group: client.user.id,
							selfDeaf: selfDeaf,
							selfMute: selfMute
						})
					}
				}, 20000);
			}
		}
	}
});