const UserModel = require("../../models/user");

const { Validate } = require("../../utils");

module.exports = {
    Index: async (req, res, next) => {
        try {
            if (req.session.userId) {
                return res.redirect("/");
            }

            res.render("auth/login", {
                title: "تسجيل الدخول",
                layout: "layouts/auth"
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/");
        }
    },
    Submit: async (req, res, next) => {
        try {
            if (req.session.userId) {
                return res.redirect("/");
            }

            const { values, errors } = await Validate.Login({
                request: req,
                source: "body"
            });

            if (errors) {
                req.setParams(req.body);
                req.setMessage(errors, "warning");

                return res.redirect("/login");
            }

            const user = await UserModel.findOne({ username: values.username }).catch(() => {});

            if (user && await user.comparePassword(values.password)) {
                req.session.userId = user.id;
                req.session.save();

                req.setMessage(`مرحبا بك يا ${user.username}`);

                return res.redirect("/");
            }else{
                req.setMessage("خطأ في اسم المستخدم أو كلمة المرور", "warning");

                return res.redirect("/login");  
            }
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/login");
        }
    }
}