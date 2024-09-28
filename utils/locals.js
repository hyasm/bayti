const moment = require("moment");

const { CheckPermission } = require("../middleware/role");

const SettingsModel = require("../models/settings");
const UserModel = require("../models/user");

module.exports = async (req, res, next) => {
    const { userId } = req.session;

    const user = userId && await UserModel.findOne({ _id: userId })
        .populate("role").catch(() => {});

    const settings = await SettingsModel.findOne({ type: "settings" }).catch(() => { });

    const params = req.flash("params");

    req.setParams = (params) => {
        req.flash("params", params);
    }

    req.setMessage = (body, variant = "success") => {
        req.flash("messages", { body, variant });
    }

    res.locals = {
        settings: settings,
        messages: req.flash("messages"),
        userdata: user && {
            id: user._id,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
            avatar: user.avatar,
            provider: user.provider,
            status: user.status,
            created_at: user.created_at,
            Can: (action = "") => {
                if (!user) {
                    return false;
                }

                return CheckPermission(user.role.roles, action).status;
            }
        },
        groups: [
            { name: "مدير عام", value: "superadmin" },
            { name: "مقدم خدمة", value: "provider" },
            { name: "معقب", value: "data_validator" },
            { name: "مستخدم", value: "user" }
        ],
        status: [
            { label: "نشط", value: true },
            { label: "غير نشط", value: false }
        ],
        toDate: (date, { format, ago, add, subtract } = {
            ago: false,
            add: [0, "days"],
            subtract: [0, "days"],
            format: "DD/MM/YYYY"
        }) => {
            try {
                if (!date) return "-";

                moment.locale("ar");

                const result = moment(+date);

                if (!result.isValid()) return "-";

                if (ago) return result.fromNow();

                if (add && add[0] != 0) return result.add(...add).format(format);
                if (subtract && subtract[0] != 0) return result.subtract(...subtract).format(format);

                return result.format(format);
            } catch (error) {
                return "-";
            }
        },
        vv: (path, def = "") => {
            if (def && params.length == 0) return def;

            if (!path || params.length == 0) return def;

            let value = params[0];
            let props = path.split(".");

            for (let i = 0; i < props.length; i += 1) {
                if (props[i] == undefined) break;
                value = value[props[i]];
            }

            return value;
        },
        getRequestStatus: (status) => {
            return {
                new: "جديد",
                active: "نشط",
                completed: "مكتمل",
            }[status] || "-"
        },
        toMimeType: (ext) => {
            if (["image/jpg", "image/jpeg", "image/png"].includes(ext)) {
                return "صورة";
            } else {
                return "ملف";
            }
        }
    };

    next();
};