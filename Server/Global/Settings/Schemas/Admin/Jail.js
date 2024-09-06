const mongoose = require('mongoose');

const model = mongoose.model("ertu-Jail", mongoose.Schema({
    No: Number,
    ID: String,
    Duration: String
}))

module.exports = model;