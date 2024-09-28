const RequestModal = require("../../models/request");
const OfferModal = require("../../models/offer");
const FileModal = require("../../models/file");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;

        const requests = await RequestModal.aggregate([
            { $match: { provider: userdata.id } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    active: { $sum: { $cond: [{ $eq: ["$_id", "نشط"] }, "$count", 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$_id", "مكتمل"] }, "$count", 0] } }
                }
            },
            { $project: { _id: 0, active: 1, completed: 1 } }
        ]);

        const offers = await OfferModal.countDocuments({
            user: userdata.id
        });

        const files = await FileModal.countDocuments({
            user: userdata.id
        });

        res.render("providers/index", {
            title: "لوحة التحكم",
            menuId: "dashboard",
            statistics: {
                active: requests[0] && requests[0].active || 0,
                completed: requests[0] && requests[0].completed || 0,
                offers: offers || 0,
                files: files || 0,
            }
        });
    },
}