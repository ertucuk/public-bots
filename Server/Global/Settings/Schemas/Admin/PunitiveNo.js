const mongoose = require('mongoose');

const model = mongoose.model("ertu-PunitiveNo", mongoose.Schema({
    No: Number,
}))

module.exports = model;