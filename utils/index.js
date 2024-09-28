const fs = require("fs");
const path = require("path");

const Random = async (length) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

const Delete = (filename) => new Promise((resolve, reject) => {
    try {
        fs.unlink(path.join(APP_PATH, "public", "uploads", filename), (err) => {
            if (err) {
                return resolve(false);
            };

            return resolve(true);
        });
    } catch (error) {
        return resolve(false);
    }
});

module.exports = {
    Locals: require("./locals"),
    Database: require("./database"),
    Validate: require("./validate"),
    Upload: require("./upload"),
    Delete,
    Random
}