const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const FILESIZE = process.env.UPLOAD_LIMIT * 1024 * 1024;
const MIMETYPES = process.env.UPLOAD_FILES.split(",");

module.exports = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dest = path.join(APP_PATH, "public", "uploads");

            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const name = crypto.randomBytes(20).toString("hex");
            const extension = file.originalname.split(".")[1];

            cb(null, `${name}.${extension}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (MIMETYPES.includes(file.mimetype)) {
            if (file.size > FILESIZE) {
                req.upload = {
                    status: false,
                    message: `حجم المسموح به ${(FILESIZE / (1024 * 1024)).toFixed(2)} ميقا بايت`
                };

                return cb(null, false);
            }

            req.upload = {
                status: true,
                message: ""
            };

            return cb(null, true);
        } else {
            req.upload = {
                status: false,
                message: `الامتدادات المسموح بها ${MIMETYPES.join(", ")}`
            };

            return cb(null, false);
        }
    },
});