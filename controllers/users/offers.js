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
                user: userdata.id
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

            res.render("users/offers/index", {
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
                user: userdata.id
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

            res.render("users/offers/view", {
                title: "ادارة العروض - تفاصيل",
                menuId: "requests",
                request,
                offer
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    },
    Accept: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, offerId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                user: userdata.id
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

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            if (req.method === "POST") {
                const { values, errors } = await Validate.Offer.Accept({
                    request: req,
                    source: "body"
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/offers/${requestId}/${offerId}/accept`);
                }

                const [acceptOffer, updateRequest] = await Promise.all([
                    OffersModel.updateOne({ _id: offerId }, { status: "نشط" }),
                    RequestModel.updateOne(
                        { _id: requestId },
                        { provider: offer.user, status: "نشط" }
                    )
                ]);

                if (acceptOffer && updateRequest) {
                    req.setMessage("تم قبول العرض بنجاح سيتم تحديث الطلب عند اكمال اي اجراء من جهة مقدم الخدمة");

                    return res.redirect(`/dashboard/requests/${requestId}`);
                }

                req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            res.render("users/offers/accept", {
                title: "ادارة العروض - قبول",
                menuId: "requests",
                request,
                offer,
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect(`/dashboard/offers/${requestId}`);
        }
    },
    Reject: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, offerId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                user: userdata.id
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

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            if (req.method === "POST") {
                const { values, errors } = await Validate.Offer.Reject({
                    request: req,
                    source: "body"
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/offers/${requestId}/${offerId}/reject`);
                }

                const rejectOffer = await OffersModel.updateOne({
                    _id: offerId
                }, {
                    status: "مرفوض",
                    reject_reason: values.reason
                });

                if (rejectOffer) {
                    req.setMessage("تم رفض العرض");

                    return res.redirect(`/dashboard/offers/${requestId}`);
                }

                req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

                return res.redirect("/dashboard/requests");
            }

            res.render("users/offers/reject", {
                title: "ادارة العروض - رفض",
                menuId: "requests",
                request,
                offer,
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    }
}