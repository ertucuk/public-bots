const mongoose = require('mongoose');

const model = mongoose.model("ertu-Mute", mongoose.Schema({
    No: Number,
    ID: String,
    Duration: String
}))

module.exports = model;