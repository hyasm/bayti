module.exports = {
    Index: async (req, res, next) => {
        try {
            if (req.session.userId) {
                return res.redirect("/");
            }

            res.render("auth/forgot", {
                title: "استعادة كلمة المرور",
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

            res.redirect("/");
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/forgot");
        }
    }
}