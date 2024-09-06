const mongoose = require('mongoose');

const model = mongoose.model("ertu-tasks", mongoose.Schema({
    POSITION: { type: Number, default: 0 },
    ROLE: { type: String, default: "" },
    EXTRA_ROLE: { type: Array, default: [] },
    DAY: { type: Number, default: 0 },
    REQUIRED_TASKS: { type: Array, default: [] }
}))

module.exports = model;