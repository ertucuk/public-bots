const mongoose = require('mongoose');

const model = mongoose.model("ertu-Forceban", mongoose.Schema({
    No: Number,
    ID: String,
}))

module.exports = model;