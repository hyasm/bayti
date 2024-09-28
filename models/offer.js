const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "requests",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    price: String,
    duration: Number,
    note: String,
    status: { type: String, default: "جديد" },
    reject_reason: String,
    created_at: { type: String, default: () => Date.now().toString() },
    updated_at: String,
});

module.exports = mongoose.model("offers", OfferSchema);