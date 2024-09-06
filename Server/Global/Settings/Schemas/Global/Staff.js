const mongoose = require('mongoose');

const model = mongoose.model('ertu-Staff', mongoose.Schema({
    id: String,
    oldRoles: { type: Array, default: [] },
    roleStarted: { type: Number, default: () => Date.now() },
    invitedUsers: { type: Array, default: [] },
    staffTakes: { type: Array, default: [] },
    tagTakes: { type: Array, default: [] },

    tasks: { type: Array, default: [] },
    task: String,
    isOldAuth: { type: Boolean, default: false },

    totalPoints: { type: Number, default: 0 },
    registerPoints: { type: Number, default: 0 },
    otherPoints: { type: Number, default: 0 },
    invitePoints: { type: Number, default: 0 },
    messagePoints: { type: Number, default: 0 },
    responsibilityPoints: { type: Number, default: 0 },
    staffPoints: { type: Number, default: 0 },
    tagPoints: { type: Number, default: 0 },
    publicPoints: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 },
}));

module.exports = model;