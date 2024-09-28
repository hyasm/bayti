const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    full_name: String,
    mobile: {
        type: String,
        trim: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles"
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false,
        set: v => v === "" ? null : v
    },
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "files",
        required: false,
        set: v => v === "" ? null : v
    },
    lastActivity: String,
    status: {
        type: String,
        enum: ["معطل", "نشط"],
        default: "نشط"
    },
    created_at: { type: String, default: () => Date.now().toString() },
    updated_at: String,
    deleted_at: String
});

UserSchema.pre("save", function (next) {
    var user = this;

    if (!user.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.pre("updateOne", async function (next) {
    let user = this.getUpdate();

    if (user.password) {
        const salt = await bcrypt.genSalt();

        user.password = await bcrypt.hash(user.password, salt);
    }

    next();
});

UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("users", UserSchema);