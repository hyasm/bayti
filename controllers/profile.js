const UserModel = require("../models/user");

const { Validate } = require("../utils");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;
        const { userId } = req.params;

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        try {
            const user = await UserModel.findOne({
                _id: userId ? userId : userdata.id
            }).populate("role");

            res.render("profile", {
                title: "الملف الشخصي",
                menuId: "home",
                user
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/");
        }
    },
    ChangePassword: async (req, res, next) => {
        const { userdata } = res.locals;

        try {
            const user = await UserModel.findOne({
                _id: userdata.id
            });


            const { values, errors } = await Validate.Profile.ChangePassword({
                request: req,
                source: "body"
            });

            if (errors) {
                req.setParams(req.body);
                req.setMessage(errors, "warning");

                return res.redirect("/profile");
            }

            const updatePassword = await user.updateOne({
                password: values.new_password
            });

            if (updatePassword) {
                req.setMessage("تم تعديل كلمة المرور بنجاح");
            } else {
                req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            }

            return res.redirect("/profile");
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/");
        }
    },
}