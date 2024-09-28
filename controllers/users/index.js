const RequestModal = require("../../models/request");
const FileModal = require("../../models/file");

module.exports = {
    Index: async (req, res, next) => {
        const { userdata } = res.locals;
        
        const active = await RequestModal.countDocuments({ status: "نشط" });
        const completed = await RequestModal.countDocuments({ status: "مكتمل" });

        const files = await FileModal.countDocuments({
            user: userdata.id
        });

        res.render("users/index", {
            title: "لوحة التحكم",
            menuId: "dashboard",
            statistics: {
                active: active || 0,
                completed: completed || 0,
                files: files || 0,
            }
        });
    },
}