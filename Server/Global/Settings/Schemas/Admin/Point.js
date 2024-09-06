const mongoose = require('mongoose');

const model = mongoose.model("ertu-point", mongoose.Schema({
    POSITION: { type: Number, default: 0 },
    ROLE: { type: String, default: "" },
    EXTRA_ROLE: { type: Array, default: [] },
    POINT: { type: Number, default: 0 }
}))

module.exports = model;