const RequestModel = require("../../models/request");
const OffersModel = require("../../models/offer");

const { Validate } = require("../../utils");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata, getRequestStatus } = res.locals;
        const { filter } = req.query;

        try {
            const filterByStatus = getRequestStatus(filter);

            if (filter && !filterByStatus) {
                req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");

                return res.redirect("/dashboard/requests");
            }

            const requests = await RequestModel.find({
                ...(filter && { status: filterByStatus }),
                $or: [
                    { provider: userdata.id },
                    { provider: null }
                ]
            }).populate("user").catch(() => {});

            res.render("providers/requests/index", {
                title: "ادارة الطلبات",
                menuId: `requests${filter ? ("_" + filter) : ""}`,
                filter,
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
                $or: [
                    { provider: userdata.id },
                    { provider: null }
                ]
            }).populate(["user", "deed_land", "map", "build_permit"]).catch(() => {});

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            res.render("providers/requests/view", {
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