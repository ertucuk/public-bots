const mongoose = require('mongoose');

const model = mongoose.model("ertu-SecretRoom", mongoose.Schema({
    id: String,
    ownerId: String,
}))

module.exports = model;