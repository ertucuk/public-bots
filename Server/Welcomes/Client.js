const { Client: Core, Partials, GatewayIntentBits, Options } = require('discord.js')

class Client extends Core {
  constructor(Settings) {
    super({
      sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
          interval: 3600,
          lifetime: 1800
        },

        users: {
          interval: 3600,
          filter: () => (user) => user?.bot && user.id !== user?.client.user?.id
        }
      },

      allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
      },

      partials: Object.keys(Partials),
      intents: Object.keys(GatewayIntentBits),
      restRequestTimeout: 30000
    })

    this.system = require('../Global/Settings/System')
    this.logger = require('../Global/Helpers/Logger')
  }
}

module.exports = { Client }
