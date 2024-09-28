const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
    name: String,
    logo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "files",
        required: false,
        set: v => v === "" ? null : v
    },
    default_role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles",
        required: false,
        set: v => v === "" ? null : v
    },
    description: String,
    register: Boolean,
    type: String,
    version: String,
    installed: Boolean
});

module.exports = mongoose.model("settings", SettingsSchema);