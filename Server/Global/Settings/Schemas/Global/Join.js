const mongoose = require('mongoose');

const model = mongoose.model('ertu-Joined', mongoose.Schema({
    userID: String,
    Voice: Number,
    Stream: Number,
    Camera: Number,
}));

module.exports = model;