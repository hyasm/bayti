const RequestModel = require("../../models/request");
const ProcedureModel = require("../../models/procedure");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
                user: userdata.id
            }).catch(() => { });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (!request.provider) {
                req.setMessage("لا يوجد عرض مقبول", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedures = await ProcedureModel.find({
                request: requestId
            }).catch(() => { });

            res.render("users/procedures/index", {
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
                user: userdata.id
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
            }).populate("attachments").catch(() => { });

            if (!procedure) {
                req.setMessage("لم يتم العثور على الإجراء", "warning");

                return res.redirect("/dashboard/requests");
            }

            res.render("users/procedures/view", {
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
                user: userdata.id
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

            res.render("users/procedures/review", {
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