const mongoose = require('mongoose');

const model = mongoose.model("ertu-Ads", mongoose.Schema({
    No: Number,
    ID: String,
}))

module.exports = model;