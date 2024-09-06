const { Events, ChannelType, bold, inlineCode, Collection } = require("discord.js");
const { User } = require('../../../Global/Settings/Schemas')
const invites = new Collection();

module.exports = {
    Name: Events.InviteCreate,
    System: true,

    execute: async (client, invite) => {
        invite.guild.invites.fetch().then((e) => {
            e.map((x) => {
                invites.set(x.code, { uses: x.uses, inviter: x.inviter, code: x.code });
            });
            client.invites.set(invite.guild.id, invites);
        });
    }
};