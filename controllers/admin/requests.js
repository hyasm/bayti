const RequestModel = require("../../models/request");
const ProcedureModel = require("../../models/procedure");

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

            const requests = await RequestModel.aggregate([
                {
                    $match: {
                        ...(filter && { status: filterByStatus })
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        let: { requestId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$request", "$$requestId"] },
                                            { $ne: ["$status", "مرفوض"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'offers_count'
                    }
                },
                {
                    $addFields: {
                        offers: { $size: "$offers_count" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: 'provider',
                        foreignField: '_id',
                        as: 'provider'
                    }
                },
                {
                    $unwind: {
                        path: '$provider',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        offers_count: 0
                    }
                }
            ]);            

            res.render("admin/requests/index", {
                title: "ادارة الطلبات",
                menuId: `requests${filter ? `_${filter}` : ""}`,
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
            }).populate(["user","provider", "deed_land", "map", "build_permit"]);

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            const procedures = await ProcedureModel.find({
                request: requestId
            }).catch(() => { });

            res.render("admin/requests/view", {
                title: "ادارة الطلبات - تفاصيل",
                menuId: "requests",
                request,
                procedures
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "warning");
            res.redirect("/dashboard/requests");
        }
    },
    Update: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
            }).catch(() => {});

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (request.provider) {
                req.setMessage("لا يمكن تعديل طلب نشط", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (req.method === "POST") {
                const { values, errors } = await Validate.Request.Update({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/requests/${requestId}/update`);
                }

                const updateRequest = await request.updateOne({
                    deed_land: values.deed_land,
                    map: values.map,
                    build_permit: values.build_permit,
                    note: values.note,
                    user: request.user,
                    updated_at: Date.now().toString()
                });

                if (updateRequest) {
                    req.setMessage("تم تعديل الطلب بنجاح");
                } else {
                    req.setParams(req.body);
                    req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
                }

                return res.redirect(`/dashboard/requests/${requestId}/update`);
            }

            res.render("admin/requests/update", {
                title: "ادارة الطلبات - تعديل",
                menuId: "requests",
                request
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

            return res.redirect(`/dashboard/requests/${requestId}/update`);
        }
    },
    Delete: async (req, res, next) => {
        const { userdata } = res.locals;
        const { requestId } = req.params;

        try {
            const request = await RequestModel.findOne({
                _id: requestId,
            });

            if (!request) {
                req.setMessage("لم يتم العثور على الطلب", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (request.provider) {
                req.setMessage("لا يمكن حذف طلب نشط", "warning");

                return res.redirect("/dashboard/requests");
            }

            if (req.method === "POST") {
                const { errors } = await Validate.Request.Delete({
                    request: req,
                    source: "body",
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/requests/${requestId}/delete`);
                }

                const deleteRequest = await RequestModel.deleteOne({ _id: requestId });

                if (deleteRequest) {
                    req.setMessage("تم حذف الطلب بنجاح");

                    return res.redirect("/dashboard/requests");
                }
            }

            res.render("admin/requests/delete", {
                title: "ادارة الطلبات - حذف",
                menuId: "requests",
                request
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

            return res.redirect("/dashboard/requests");
        }
    }
}