const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    deed_land: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "files"
    },
    map: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "files"
    },
    build_permit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "files"
    },
    note: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false,
        set: v => v === "" ? null : v
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false,
        set: v => v === "" ? null : v
    },
    status: {
        type: String,
        enum: ["جديد", "نشط", "مكتمل"],
        default: "جديد"
    },
    created_at: { type: String, default: () => Date.now().toString() },
    updated_at: String,
});

module.exports = mongoose.model("requests", RequestSchema);