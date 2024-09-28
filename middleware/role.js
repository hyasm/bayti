const RoleModel = require("../models/role");
const UserModel = require("../models/user");

const CheckPermission = (roles = "", action = "") => {
    let list = {};
    let start = 0;

    const resources = RoleModel.List.resources;

    const [resource, method] = action.split(".");

    resources.forEach(res => {
        let length = res["perms"].length;
        let prems = roles.slice(start, start + length);

        list[res.name] = prems.split("").map(r => r === "1");

        start += length;
    });

    const find = resources.find(res => res.name == resource);

    if (!find) {
        return {
            status: false,
            message: "حدث خطأ يرجى المحاولة مرة أخرى"
        }
    };

    const index = find["perms"].indexOf(method);

    if (index == -1) return false;

    return list[resource][index] ? {
        status: true
    } : {
        status: false,
        message: "لا يوجد لديك صلاحية لعرض هذي الصفحة"
    };
}

const getUser = async (req) => {
    const { userId } = req.session;

    if (!userId) {
        return false;
    }

    const user = await UserModel.findOne({ _id: userId }).populate("role").catch(() => { });

    if (user) {
        user.lastActivity = Date.now().toString();
        await user.save();

        return user;
    }

    return false;
}

module.exports = {
    CheckPermission: CheckPermission,
    Can: (action = "") => async (req, res, next) => {
        const user = await getUser(req);

        if (!user) {
            return res.render("error", {
                menuId: "",
                errorTitle: "خطأ في الوصول",
                errorContent: "يجب تسجيل الدخول أولا"
            });
        }

        const perms = await CheckPermission(user.role.roles, action);

        if (perms.status) {
            return next();
        }

        return res.render("error", {
            menuId: "",
            errorTitle: "خطأ في الوصول",
            errorContent: perms.message
        });
    }
}