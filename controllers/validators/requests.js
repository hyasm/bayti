const RequestModel = require("../../models/request");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;

        try {
            const requests = await RequestModel.find({
                provider: userdata.provider
            }).populate("user").catch(() => { });

            res.render("validators/requests/index", {
                title: "ادارة الطلبات",
                menuId: "requests",
                requests
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    },
    View: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                provider: userdata.provider,
            }).populate(["user", "deed_land", "map", "build_permit"]).catch((err) => console.log(err));

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            res.render("validators/requests/view", {
                title: "ادارة الطلبات - تفاصيل",
                menuId: "requests",
                request
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    }
}