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
                provider: userdata.id
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedures = await ProcedureModel.find({
                request: requestId,
            }).catch(() => { });

            res.render("providers/procedures/index", {
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
                provider: userdata.id
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedure = await ProcedureModel.findOne({
                _id: procedureId,
                request: requestId,
            }).populate("attachments").catch(() => { });

            if (!procedure) {
                req.setMessage("لم يتم العثور على الإجراء", "warning");

                return res.redirect("/dashboard/requests");
            }

            res.render("providers/procedures/view", {
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
    Create: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                provider: userdata.id
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (req.method === "POST") {
                const { values, errors } = await Validate.Procedure({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/procedures/${requestId}/create`);
                }

                const createProcedure = await new ProcedureModel({
                    request: requestId,
                    user: userdata.id,
                    title: values.title,
                    note: values.note,
                    attachments: values.attachments
                }).save();

                if (createProcedure) {
                    req.setMessage("تم انشاء الإجراء بنجاح");
                }else{
                    req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
                }

                return res.redirect(`/dashboard/procedures/${requestId}/create`);
            }

            res.render("providers/procedures/create", {
                title: "ادارة الإجراءات - انشاء",
                menuId: "requests",
                requestId
            });
        } catch (error) {
            console.log(error);
            
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            
            return res.redirect(`/dashboard/procedures/${requestId}/create`);
        }
    },
    Review: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId, procedureId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                provider: userdata.id
            }).populate("provider");

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (!request.provider) {
                req.setMessage("لا يوجد عرض مقبول", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedure = await ProcedureModel.findOne({
                _id: procedureId,
                request: requestId,
            }).populate(["review.attachments", "review.user"]).catch(() => { });

            if (!procedure) {
                req.setMessage("لم يتم العثور على الإجراء", "warning");

                return res.redirect("/dashboard/requests");
            }

            res.render("providers/procedures/review", {
                title: "ادارة الإجراءات - تفاصيل المراجعة",
                menuId: "requests",
                requestId,
                procedure
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    }
}