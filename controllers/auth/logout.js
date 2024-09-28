module.exports = {
    Index: async (req, res, next) => {
        try {
            if (req.session.userId) {
                req.session.userId = null;

                req.setMessage("تم تسجيل الخروج بنجاح", "warning");
            }

            res.redirect("/login");
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/");
        }
    }
}