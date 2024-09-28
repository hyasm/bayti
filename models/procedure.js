const mongoose = require("mongoose");

const ProcedureSchema = new mongoose.Schema({
    title: String,
    attachments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "files",
    }],
    note: String,
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "requests",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    review: {
        note: String,
        attachments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "files",
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: false,
            set: v => v === "" ? null : v
        },
        status: {
            type: String,
            enum: ["مكتمل", "مرفوض"]
        },
        reviewed_at: String,
    },
    status: {
        type: String,
        enum: ["جديد", "مكتمل", "مرفوض"],
        default: "جديد"
    },
    created_at: { type: String, default: () => Date.now().toString() },
    updated_at: String,
});

module.exports = mongoose.model("procedures", ProcedureSchema);