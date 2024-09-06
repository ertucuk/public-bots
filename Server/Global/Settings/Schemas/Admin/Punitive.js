const mongoose = require('mongoose');

const model = mongoose.model("ertu-Punitive", mongoose.Schema({
    No: Number,
    Member: String,
    Staff: String,
    Type: String,
    Reason: String,
    Duration: Date,
    Date: Date,
    Expried: Date,
    Remover: String,
    Active: { type: Boolean, default: true },
    Image: { type: Buffer }
}))

module.exports = model;