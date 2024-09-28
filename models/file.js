const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    name: String,
    description: String,
    mime_type: String,
    size: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false,
        set: v => v === "" ? null : v
    },
    created_at: { type: String, default: () => Date.now().toString() },
    updated_at: String,
});

module.exports = mongoose.model("files", FileSchema);