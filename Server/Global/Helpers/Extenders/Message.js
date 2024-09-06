const { Message } = require('discord.js');

module.exports = Object.defineProperties(Message.prototype, {
    clear: {
        value: async function ({ timeout }) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this);
                }, timeout * 1000);
            }).then((message) => {

                return message.delete().catch((err) => { });
            });

        },
    },
});