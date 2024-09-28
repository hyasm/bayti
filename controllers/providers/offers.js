const RequestModel = require("../../models/request");
const OffersModel = require("../../models/offer");

const { Validate } = require("../../utils");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {

            const request = await RequestModel.findOne({
                _id: requestId,
                $or: [
                    { provider: userdata.id },
                    { provider: null }
                ]
            }).catch(() => { });

            if (request.provider) {
                req.setMessage("تم قبول عرض بالفعل", "warning");

                return res.redirect("/dashboard/requests");
            }

            const offers = await OffersModel.find({
                request: requestId,
                user: userdata.id
            }).catch(() => { });

            res.render("providers/offers/index", {
                title: "ادارة العروض",
                menuId: "requests",
                requestId,
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
                $or: [
                    { provider: userdata.id },
                    { provider: null }
                ]
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (request.provider) {
                req.setMessage("تم قبول عرض بالفعل", "warning");

                return res.redirect("/dashboard/requests");
            }

            const offer = await OffersModel.findOne({
                _id: offerId,
                request: requestId,
                user: userdata.id
            }).populate("request").catch(() => { });

            if (!offer) {
                req.setMessage("لم يتم العثور على العرض", "warning");

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            res.render("providers/offers/view", {
                title: "ادارة العروض - تفاصيل",
                menuId: "requests",
                requestId,
                offer
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect(`/dashboard/offers/${requestId}`);
        }
    },
    Create: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                $or: [
                    { provider: userdata.id },
                    { provider: null }
                ]
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (req.method === "POST") {
                const { values, errors } = await Validate.Offer.Create({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/offers/${requestId}/create`);
                }

                const createOffer = await new OffersModel({
                    request: requestId,
                    user: userdata.id,
                    price: values.price,
                    duration: values.duration,
                    note: values.note
                }).save();

                if (createOffer) {
                    req.setMessage("تم انشاء العرض بنجاح");

                    return res.redirect(`/dashboard/offers/${requestId}/create`);
                }
            }

            res.render("providers/offers/create", {
                title: "ادارة العروض - انشاء",
                menuId: "requests",
                requestId,
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
        }
    },
    Update: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, offerId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                $or: [
                    { provider: userdata.id },
                    { provider: null }
                ]
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const offer = await OffersModel.findOne({
                _id: offerId,
                user: userdata.id
            }).catch(() => { });

            if (!offer) {
                req.setMessage("لم يتم العثور على العرض", "warning");

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            if (offer.status == "نشط") {
                req.setMessage("لا يمكن تعديل عرض نشط", "warning");

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            if (req.method == "POST") {
                const { values, errors } = await Validate.Offer.Update({
                    request: req,
                    source: "body"
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/offers/${requestId}/${offerId}/update`);
                }

                const updateOffer = await offer.updateOne({
                    price: values.price,
                    duration: values.duration,
                    note: values.note,
                    status: "جديد",
                    updated_at: Date.now().toString()
                });

                if (updateOffer) {
                    req.setMessage("تم تعديل العرض بنجاح");
                } else {
                    req.setParams(req.body);
                    req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
                }

                return res.redirect(`/dashboard/offers/${requestId}/${offerId}/update`);
            }

            res.render("providers/offers/update", {
                title: "ادارة العروض - تعديل",
                menuId: "requests",
                requestId,
                offer
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
        }
    },
    Delete: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, offerId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                $or: [
                    { provider: userdata.id },
                    { provider: null }
                ]
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const offer = await OffersModel.findOne({
                _id: offerId,
                user: userdata.id
            }).catch(() => { });

            if (!offer) {
                req.setMessage("لم يتم العثور على العرض", "warning");

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            if (offer.status == "نشط") {
                req.setMessage("لا يمكن حذف عرض نشط", "warning");

                return res.redirect(`/dashboard/offers/${requestId}`);
            }

            if (req.method === "POST") {
                const { errors } = await Validate.Offer.Delete({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/offers/${requestId}/${offerId}/delete`);
                }

                const deleteOffer = await RequestModel.deleteOne({ _id: requestId });

                if (deleteOffer) {
                    req.setMessage("تم حذف العرض بنجاح");

                    return res.redirect(`/dashboard/offers/${requestId}`);
                }
            }

            res.render("providers/offers/delete", {
                title: "ادارة العروض - حذف",
                menuId: "requests",
                offer,
                requestId
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
        }
    }
}