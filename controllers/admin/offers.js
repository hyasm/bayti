const RequestModel = require("../../models/request");
const OffersModel = require("../../models/offer");

const { Validate } = require("../../utils");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, offerId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
            }).catch(() => { });

            if (!request) {
                req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
                return res.redirect("/dashboard/requests");
            }

            if (request.provider) {
                req.setMessage("تم قبول عرض بالفعل", "warning");

                return res.redirect(`/dashboard/requests/${requestId}`);
            }

            const offers = await OffersModel.find({
                request: request.id,
                status: { $ne: "مرفوض" }
            }).populate("user");

            res.render("admin/offers/index", {
                title: "ادارة العروض",
                menuId: "requests",
                request,
                offers
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    },
    View: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, offerId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
            }).catch(() => { });

            const offer = await OffersModel.findOne({
                _id: offerId,
                status: { $ne: "مرفوض" }
            }).populate("user").catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (!offer) {
                req.setMessage("لم يتم العثور على العرض", "warning");

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            if (request.provider) {
                req.setMessage("تم قبول عرض بالفعل", "warning");

                return res.redirect("/dashboard/requests");
            }

            res.render("admin/offers/view", {
                title: "ادارة العروض - تفاصيل",
                menuId: "requests",
                request,
                offer
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    }
}