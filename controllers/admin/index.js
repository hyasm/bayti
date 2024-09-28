const UserModal = require("../../models/user");
const FileModal = require("../../models/file");
const RequestModal = require("../../models/request");

const Index = async (req, res, next) => {
    try {
        const users = await UserModal.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "role",
                    foreignField: "_id",
                    as: "result"
                }
            },
            { $unwind: "$result" },
            {
                $group: {
                    _id: "$result.type",
                    count: { $sum: 1 }
                }
            },
        ]);

        const files = await FileModal.countDocuments();
        const requests = await RequestModal.countDocuments();

        const roles = users && users.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}) || null;

        res.render("admin/index", {
            title: "لوحة التحكم",
            menuId: "dashboard",
            statistics: {
                admins: roles && roles.admin || 0,
                users: roles && roles.user || 0,
                providers: roles && roles.provider || 0,
                validators: roles && roles.validator || 0,
                files,
                requests
            }
        });
    } catch (error) {
        req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
        res.redirect("/");
    }
}

module.exports = {
    Index,
}