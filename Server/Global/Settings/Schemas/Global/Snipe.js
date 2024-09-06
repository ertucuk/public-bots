const mongoose = require('mongoose');

const model = mongoose.model('ertu-Snipe', mongoose.Schema({
    guildID: String,
    deletedMessages: Object,
}));

module.exports = model;