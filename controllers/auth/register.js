const UserModel = require("../../models/user");

const { Validate } = require("../../utils");

module.exports = {
    Index: async (req, res, next) => {
        try {
            if (req.session.userId) {
                return res.redirect("/");
            }

            if (!res.locals.settings.register) {
                req.setMessage("التسجيل مغلق", "warning");

                return res.redirect("/");
            }

            res.render("auth/register", {
                title: "تسجيل حساب جديد",
                layout: "layouts/auth"
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/");
        }
    },
    Submit: async (req, res, next) => {
        try {
            const settings = res.locals.settings;

            if (req.session.userId) {
                return res.redirect("/");
            }

            if (!settings.register) {
                req.setMessage("التسجيل مغلق", "warning");

                return res.redirect("/");
            }

            const { values, errors } = await Validate.Register({
                request: req,
                source: "body"
            });

            if (errors) {
                req.setParams(req.body);
                req.setMessage(errors, "warning");

                return res.redirect("/register");
            }

            const createUser = new UserModel({
                username: values.username,
                email: values.email,
                mobile: values.mobile,
                password: values.password,
                full_name: values.full_name,
                role: settings.default_role,
            }).save();

            if (createUser) {
                req.setMessage("تم انشاء الحساب بنجاح");

                return res.redirect("/login");
            }
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/register");
        }
    }
}