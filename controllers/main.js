const bcrypt = require("bcrypt");

const RoleModel = require("../models/role");
const UserModel = require("../models/user");
const SettingsModel = require("../models/settings");

module.exports = {
    Index: async (req, res, next) => {
        res.render("main", {
            title: "الرئيسية",
            menuId: "home"
        });
    },
    Setup: async (req, res, next) => {
        try {
            const settings = await SettingsModel.findOne({
                type: "settings"
            }).catch(() => { });

            if (settings && settings.installed) {
                req.setMessage("تم اعداد النظام من قبل", "info");

                return res.redirect("/");
            }

            let rolesSuccess = true;

            const roles = [
                { type: "admin", name: "الإدارة العامة" },
                { type: "user", name: "مستخدم" },
                { type: "validator", name: "معقب" },
                { type: "provider", name: "مقدم خدمة" }
            ];

            for (const role of roles) {
                try {
                    const init = await RoleModel.findOneAndUpdate(
                        { type: role.type },
                        {
                            $set: {
                                ...role,
                                system: true,
                                status: "نشط"
                            }
                        },
                        { upsert: true, new: true }
                    );

                    if (!init) {
                        rolesSuccess = false;
                    }
                } catch (error) {
                    rolesSuccess = false;
                }
            }

            if (rolesSuccess) {
                const [adminRole, userRole] = await Promise.all([
                    RoleModel.findOne({ type: "admin" }),
                    RoleModel.findOne({ type: "user" })
                ]);

                if (!adminRole || !userRole) {
                    return res.send("فشل اعداد النظام: لم يتم العثور على الأدوار.");
                }

                const passwordSalt = await bcrypt.genSalt();

                const adminUser = UserModel.findOneAndUpdate(
                    { username: "admin" },
                    {
                        $set: {
                            username: "admin",
                            email: "admin@bayti.com",
                            mobile: "0500000000",
                            password: await bcrypt.hash("admin@123", passwordSalt),
                            full_name: "الإدارة العامة",
                            role: adminRole._id,
                        }
                    },
                    { upsert: true, new: true }
                );

                const appSettings = SettingsModel.findOneAndUpdate(
                    { type: "settings" },
                    {
                        $set: {
                            name: "Bayti",
                            logo: "",
                            description: "Bayti",
                            mobile: "",
                            email: "support@bayti.com",
                            register: true,
                            default_role: userRole._id,
                            type: "settings",
                            version: "0.0.1",
                            installed: true
                        }
                    },
                    { upsert: true, new: true }
                );

                const [adminResult, settingsResult] = await Promise.all([
                    adminUser,
                    appSettings
                ]);

                if (adminResult && settingsResult) {
                    req.setMessage("تم اعداد النظام بنجاح", "success");

                    return res.redirect("/");
                } else {
                    return res.send("فشل اعداد النظام: حدث خطأ اثناء انشاء حساب الإدارة وإعدادات النظام.");
                }
            }

            return res.send("فشل اعداد النظام: لم يتم العثور على الصلاحيات.");
        } catch (error) {
            return res.send("حدث خطأ يرجى المحاولة مرة أخرى");
        }
    }
}