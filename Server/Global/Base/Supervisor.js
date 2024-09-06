const { Client, Partials, GatewayIntentBits, Collection, ApplicationCommandType, ButtonStyle, Options, PermissionFlagsBits, GuildPremiumTier } = require('discord.js');
const { FileManager } = require("../Handlers"), { Logger, Validator } = require("../Helpers");
const { GiveawaysManager } = require("vante-giveaways");
const Database = require("./Database/JsonProvider");
const { loadFont } = require('canvas-constructor/skia')
const { resolve } = require('path');

class VanteClient extends Client {
    constructor(Settings) {
        super({
            sweepers: {
                ...Options.DefaultSweeperSettings,
                messages: {
                    interval: 3600,
                    lifetime: 1800,
                },

                users: {
                    interval: 3600,
                    filter: () => user => user?.bot && user.id !== user?.client.user?.id,
                },
            },

            allowedMentions: {
                parse: ['users', 'roles'],
                repliedUser: false
            },

            partials: Object.keys(Partials),
            intents: Object.keys(GatewayIntentBits),
            restRequestTimeout: 30000,
        });

        this.Vante = Settings,
        this.commands = new Collection();
        this.aliases = new Collection();
        this.slashCommands = new Collection();
        this.contextMenus = new Collection();
        this.cooldowns = new Collection();
        this.invites = new Collection();
        this.afks = global.afks = new Collection();
       
        this.emojidb = global.emojidb = new Database({ path: '../../Global/Settings/Server/Emojis.json' });
        this.logs = global.logs = require('../../Global/Settings/Server/Data.js').ServerLogsChannel;
        this.data = global.data = require('../../Global/Settings/Server/Data.js')

        this.system = (global.system = require("../../Global/Settings/System"));
        this.answers = (global.cevap = global.cevaplar = require('../Settings/Server/Answers'));
        this.logger = (global.logger = Logger);

        this.database = (global.database = require("../Settings/Schemas"));
        this.VanteEmbed = (global.VanteEmbed = require("../Services/Embed"));
        this.mongoose = (global.mongoose = require("./Database"));
        this.mongoose.start(this);

        require("../Helpers/Extenders");
        require("../Handlers/FontsHandler");
        require("../Handlers/CrashHandler");

        this.giveawaysManager = new GiveawaysManager(this, {
            storage: '../../Global/Settings/Server/Giveaways.json',
            default: {
                botsCanWin: true,
                embedColor: '#0a0000',
                buttonEmoji: '🎉',
                buttonStyle: ButtonStyle.Secondary,
            },
        });
    };

    async spawn() {
        this.logger.success(`Spawns shards and initializes the application.`);
        let success = 0, error = 0;

        const Events = new FileManager({
            Folder: 'Events',
            Type: 'Event',
            Load: true
        });

        const Commands = new FileManager({
            Folder: 'Commands',
            Type: 'Command',
            Load: this.Vante.Commands || false
        });

        const Contexts = new FileManager({
            Folder: 'Contexts',
            Type: 'Context',
            Load: this.Vante.Contexts || false

        });

        for (const file of Events.filePaths) {
            try {
                const event = require(file);
                if (event && event.System) {
                    if (typeof event.execute === 'function') {
                        this.on(event.Name, event.execute.bind(null, this));
                        success += 1;
                    } else {
                        this.logger.error(`Event file (${file}) is missing the 'execute' function.`);
                        error += 1;
                    }

                    delete require.cache[require.resolve(file)];
                } else { }
            } catch (ex) {
                error += 1;
                this.logger.error(`loadEvent (${file}) - ${ex}`);
            }
        }


        for (const file of Commands.filePaths) {
            try {
                const data = require(file);
                if (typeof data !== 'object') continue;

                const valid = Validator.Command(data, { Logger: this.logger });

                if (valid) {
                    if (data.Command.Prefix) {
                        if (this.commands.has(data.Name)) {
                            throw new Error(`Command "${data.Name}" already registered`);
                        };

                        if (Array.isArray(data.Aliases)) {
                            data.Aliases.forEach((alias) => {
                                if (this.aliases.has(alias)) throw new Error(`Alias ${alias} already registered`);
                                this.aliases.set(alias, data);
                            });
                        };

                        this.commands.set(data.Name, data);
                    };

                    if (data.Command.Slash) {
                        if (this.slashCommands.has(data.Name)) throw new Error(`Slash Command "${data.Name}" already registered`);
                        this.slashCommands.set(data.Name, data);
                    };
                };
            } catch (error) {
                this.logger.error(`Failed to load ${file} Reason: ${error.message}`);
            };
        };

        for (const file of Contexts.filePaths) {
            try {
                const data = require(file);
                if (typeof data !== 'object') continue;

                const valid = Validator.Context(data, { Logger: this.logger });

                if (valid) {
                    if (data.Enabled) {
                        if (this.contextMenus.has(data.Name)) throw new Error(`Context already exists with that name`);
                        this.contextMenus.set(data.Name, data);
                    };
                };
            } catch (error) {
                this.logger.error(`Failed to load ${file} Reason: ${error.message}`);
            };
        };


        this.logger.success(`Loaded ${this.commands.size + this.slashCommands.size + this.contextMenus.size} commands (Prefix: ${this.commands.size} Slash: ${this.slashCommands.size} Context: ${this.contextMenus.size})`);
        this.logger.success(`Loaded ${success + error} events. Success (${success}) Failed (${error})`);

        if (this.slashCommands.size > 100) this.logger.error('A maximum of 100 slash commands can be enabled');

        return super.login(this.Vante.Token).then(app => {
            this.on('ready', async (client) => {

                loadFont('Kanit', resolve(__dirname, "../Assets/Fonts", "Kanit-Regular.ttf"));

                for (const guild of [...client.guilds.cache.values()]) {
                    Promise.all([
                        guild.fetchSettings(),
                    ]);
                }

                setInterval(async () => {
                    client.guilds.cache.forEach(async guild => {
                        Promise.all([
                            guild.fetchSettings(),
                        ]);
                    });
                }, 25 * 1000)

                client.giveawaysManager.on('giveawayJoined', (giveaway, member, interaction) => {
                    return interaction.reply({ content: `🎉 Tebrikler **${member}**, çekilişe katıldınız`, ephemeral: true })
                });

                client.giveawaysManager.on('giveawayLeaved', (giveaway, member, interaction) => {
                    return interaction.reply({ content: `🎉 **${member}**, çekilişten başarıyla çıktınız`, ephemeral: true })
                });

                if (this.Vante.Commands || this.Vante.Contexts) {
                    const interactionToRegister = [];

                    this.slashCommands.forEach((cmd) => {
                        interactionToRegister.push({
                            name: cmd.Name,
                            description: cmd.Description,
                            type: ApplicationCommandType.ChatInput,
                            options: cmd.Command.Options,
                        });
                    });

                    this.contextMenus.forEach((cmd) => {
                        interactionToRegister.push({
                            name: cmd.Name,
                            type: cmd.Type,
                        });
                    });

                    await this.application.commands.set(interactionToRegister);
                }

                this.logger.loaded(this);
                this.logger.line();
            });
        });
    };
};

module.exports = { VanteClient };