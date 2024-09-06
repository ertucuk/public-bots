const mongoose = require('mongoose');

const model = mongoose.model("ertu-VoiceMute", mongoose.Schema({
    No: Number,
    ID: String,
    Duration: String
}))

module.exports = model;