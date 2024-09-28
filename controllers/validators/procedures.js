const RequestModel = require("../../models/request");
const ProcedureModel = require("../../models/procedure");

const { Validate } = require("../../utils");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                provider: userdata.provider,
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedures = await ProcedureModel.find({
                request: requestId,
                user: userdata.provider,
            }).catch(() => { });

            res.render("validators/procedures/index", {
                title: "ادارة الإجراءات",
                menuId: "requests",
                requestId,
                procedures
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    },
    View: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, procedureId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                provider: userdata.provider
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedure = await ProcedureModel.findOne({
                _id: procedureId,
                request: requestId,
                user: userdata.provider,
            }).populate("attachments").catch(() => { });

            if (!procedure) {
                req.setMessage("لم يتم العثور على الإجراء", "warning");

                return res.redirect(`/dashboard/procedures/${requestId}`);
            }

            res.render("validators/procedures/view", {
                title: "ادارة الإجراءات - تفاصيل",
                menuId: "requests",
                requestId,
                procedure
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    },
    Review: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, procedureId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                provider: userdata.provider
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedure = await ProcedureModel.findOne({
                _id: procedureId,
                request: requestId,
                user: userdata.provider,
            }).populate(["review.attachments", "review.user"]).catch(() => { });

            if (!procedure) {
                req.setMessage("لم يتم العثور على الإجراء", "warning");

                return res.redirect(`/dashboard/procedures/${requestId}`);
            }

            res.render("validators/procedures/review", {
                title: "ادارة الإجراءات - تفاصيل المراجعة",
                menuId: "requests",
                requestId,
                procedure
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    },
    Approve: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, procedureId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                provider: userdata.provider
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedure = await ProcedureModel.findOne({
                _id: procedureId,
                request: requestId,
                user: userdata.provider,
            }).populate("user").catch(() => { });

            if (!procedure) {
                req.setMessage("لم يتم العثور على الإجراء", "warning");

                return res.redirect(`/dashboard/procedures/${requestId}`);
            }

            if (procedure.review && procedure.review.user) {
                req.setMessage("تم مراجعة الإجراء من قبل", "warning");

                return res.redirect(`/dashboard/procedures/${requestId}`);
            }

            if (req.method === "POST") {
                const { values, errors } = await Validate.ProcedureApprove({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/procedures/${requestId}/${procedureId}/approve`);
                }

                const updateProcedure = await procedure.updateOne({
                    status: values.agreement == "yes" ? "مكتمل" : "مرفوض",
                    review: {
                        note: values.note,
                        attachments: values.attachments,
                        user: userdata.id,
                        status: values.agreement == "yes" ? "مكتمل" : "مرفوض",
                        reviewed_at: Date.now().toString(),
                    }
                });

                if (updateProcedure) {
                    req.setMessage("تم مراجعة الإجراء بنجاح");

                    return res.redirect(`/dashboard/procedures/${requestId}`);
                }
            }

            res.render("validators/procedures/approve", {
                title: "ادارة الإجراءات - مراجعة",
                menuId: "requests",
                requestId,
                procedure
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect(`/dashboard/procedures/${requestId}`);
        }
    }
}