const { Events, AuditLogEvent } = require("discord.js");
const { User } = require('../../../../Global/Settings/Schemas');
const { Punish, Log } = require('./Functions');

module.exports = {
    Name: Events.VoiceStateUpdate,
    System: true,

    execute: async (client, oldState, newState) => {
        Punish(client, oldState, newState);
        Log(client, oldState, newState);
    }
};