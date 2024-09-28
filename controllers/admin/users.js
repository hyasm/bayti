const RoleModel = require("../../models/role");
const UserModel = require("../../models/user");

const { Validate } = require("../../utils");

module.exports = {
    Index: async (req, res, next) => {
        try {
            const users = await UserModel.find().populate("role").catch(() => { });

            res.render("admin/users/index", {
                title: "ادارة المستخدمين",
                menuId: "users",
                users
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/users");
        }
    },
    View: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const user = await UserModel.findOne({
                _id: userId,
            }).populate("role").catch(() => { });

            if (!user) {
                req.setMessage("لم يتم العثور على المستخدم", "warning");

                return res.redirect("/dashboard/users");
            }

            res.render("admin/users/view", {
                title: "ادارة المستخدمين - تفاصيل",
                menuId: "requests",
                user
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/users");
        }
    },
    Create: async (req, res, next) => {
        try {
            const roles = await RoleModel.find().catch(() => { });
            const providers = await UserModel.aggregate([
                {
                    $lookup: {
                        from: "roles",
                        localField: "role",
                        foreignField: "_id",
                        as: "result"
                    }
                },
                { $unwind: "$result" },
                { $match: { "result.type": "provider" } }
            ]).catch(() => { });

            if (req.method === "POST") {
                const { values, errors } = await Validate.User(false)({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");
                    return res.redirect("/dashboard/users/create");
                }

                const newUser = await new UserModel({
                    username: values.username,
                    password: values.password,
                    email: values.email,
                    full_name: values.full_name,
                    mobile: values.mobile,
                    role: values.role,
                    provider: values.provider || null,
                    status: values.status,
                    created_at: Date.now().toString(),
                }).save();

                if (newUser) {
                    req.setMessage("تم انشاء المستخدم بنجاح");
                }

                return res.redirect("/dashboard/users/create");
            }

            res.render("admin/users/create", {
                title: "ادارة المستخدمين - انشاء",
                menuId: "users",
                roles,
                providers
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

            return res.redirect("/dashboard/users/create");
        }
    },
    Update: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const user = await UserModel.findOne({
                _id: userId
            }).populate(["role", "provider"]).catch(() => { });

            const roles = await RoleModel.find().catch(() => { });
            const providers = await UserModel.aggregate([
                {
                    $lookup: {
                        from: "roles",
                        localField: "role",
                        foreignField: "_id",
                        as: "result"
                    }
                },
                { $unwind: "$result" },
                { $match: { "result.type": "provider" } },
                {
                    $project: {
                        full_name: 1,
                        role: "$result"
                    }
                }
            ]).catch(() => { });

            if (!user) {
                req.setMessage("لم يتم العثور على المستخدم", "warning");

                return res.redirect("/dashboard/users");
            }

            if (req.method === "POST") {
                const { values, errors } = await Validate.User(true)({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/users/${userId}/update`);
                }

                if (values.provider != "" && user.role.type != "validator") {
                    req.setMessage("يجب اختيار الصلاحية معقب", "warning");

                    return res.redirect(`/dashboard/users/${userId}/update`);
                }

                if (user.username == "admin" && values.role != user.role) {
                    req.setMessage("لا يمكن تغير صلاحية حساب الإدارة", "warning");

                    return res.redirect(`/dashboard/users/${userId}/update`);
                }

                const updateUser = await user.updateOne({
                    username: values.username,
                    ...(values.password && { password: values.password }),
                    email: values.email,
                    full_name: values.full_name,
                    mobile: values.mobile,
                    ...(values.provider && { provider: values.provider }),
                    role: values.role,
                    status: values.status,
                    updated_at: Date.now().toString(),
                });

                if (updateUser) {
                    req.setMessage("تم تعديل المستخدم بنجاح");
                } else {
                    req.setParams(req.body);
                    req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
                }

                return res.redirect(`/dashboard/users/${userId}/update`);
            }

            res.render("admin/users/update", {
                title: "ادارة المستخدمين - تعديل",
                menuId: "users",
                user,
                roles,
                providers
            });
        } catch (error) {
            console.log(error);

            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

            return res.redirect(`/dashboard/users/${userId}/update`);
        }
    },
    Delete: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const user = await UserModel.findOne({
                _id: userId
            }).catch(() => { });

            if (!user) {
                req.setMessage("لم يتم العثور على المستخدم", "warning");

                return res.redirect("/dashboard/users");
            }

            if (user.username === "admin") {
                req.setMessage("لا يمكنك حذف حساب الإدارة", "danger");

                return res.redirect("/dashboard/users");
            }

            if (req.method === "POST") {
                const { errors } = await Validate.User.Delete({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/users/${userId}/delete`);
                }

                await UserModel.deleteOne({ _id: userId });

                req.setMessage("تم حذف المستخدم بنجاح");

                return res.redirect("/dashboard/users");
            }

            res.render("admin/users/delete", {
                title: "ادارة المستخدمين - حذف",
                menuId: "users",
                user,
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

            return res.redirect("/dashboard/users");
        }
    }
}