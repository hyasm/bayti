const mongoose = require("mongoose");

module.exports = (options = null) => {
    mongoose.connect(process.env.DATABASE_URL, options);

    const db = mongoose.connection;

    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log(`Database Connected: ${db.host}`));
};