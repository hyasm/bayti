const FileModel = require("../../models/file");
const RequestModal = require("../../models/request");
const ProcedureModal = require("../../models/procedure");

const { Validate, Delete } = require("../../utils");

module.exports = {
    List: async (req, res, next) => {
        const { userdata } = res.locals;

        try {
            const files = await FileModel.find({}).populate("user").catch(() => {});

            if (files) {
                return res.render("admin/files/api", {
                    files,
                    layout: "layouts/blank",
                }, (err, html) => {
                    return res.status(200).json({
                        status: true,
                        result: html
                    });
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            });
        }
    },
    Upload: async (req, res, next) => {
        const { userdata } = res.locals;

        try {
            if (req.method == "POST") {
                const { values, errors } = await Validate.File.Create({
                    request: req,
                    source: "body"
                });

                if (errors) {
                    return res.status(500).json({
                        status: false,
                        message: errors
                    });
                }

                if (!req.upload) {
                    return res.status(500).json({
                        status: false,
                        message: "- الملف : مطلوب."
                    });
                }

                if (req.upload && req.upload.status == false) {
                    return res.status(500).json({
                        status: false,
                        message: `- الملف : ${req.upload.message}.`
                    });
                }

                const _new = await new FileModel({
                    title: values.title,
                    name: req.file && req.file.filename || "",
                    description: values.description,
                    mime_type: req.file && req.file.mimetype || "",
                    size: req.file && req.file.size || "",
                }).save();

                if (_new) {
                    return res.status(200).json({
                        status: true,
                        message: "تم انشاء الملف بنجاح"
                    });
                }

                await Delete(req.file.filename);

                return res.status(500).json({
                    status: false,
                    message: "حدث خطأ يرجى المحاولة مرة أخرى"
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error
            });
        }
    },
    Index: async (req, res, next) => {
        const { userdata } = res.locals;

        const files = await FileModel.find({}).populate("user").catch(() => {});

        res.render("admin/files/index", {
            title: "ادارة الملفات",
            menuId: "files",
            files
        });
    },
    View: async (req, res, next) => {
        const { userdata } = res.locals;
        const { fileId } = req.params;

        try {
            const file = await FileModel.findOne({
                _id: fileId,
            }).populate("user").catch(() => { });

            if (!file) {
                req.setMessage("لم يتم العثور على الملف", "warning");

                return res.redirect("/dashboard/files");
            }

            res.render("admin/files/view", {
                title: "ادارة الملفات - تفاصيل",
                menuId: "files",
                file
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
            res.redirect("/dashboard/files");
        }
    },
    Create: async (req, res, next) => {
        const { userdata } = res.locals;

        try {
            if (req.method == "POST") {
                const { values, errors } = await Validate.File.Create({
                    request: req,
                    source: "body"
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect("/dashboard/files/create");
                }

                if (!req.upload && !req.file) {
                    req.setParams(req.body);
                    req.setMessage("- الملف : مطلوب.", "warning");

                    return res.redirect("/dashboard/files/create");
                }

                if (req.upload && req.upload.status == false) {
                    req.setParams(req.body);
                    req.setMessage(`- الملف : ${req.upload.message}.`, "warning");

                    return res.redirect("/dashboard/files/create");
                }

                const createFile = await new FileModel({
                    title: values.title,
                    name: req.file && req.file.filename || "",
                    description: values.description,
                    mime_type: req.file && req.file.mimetype || "",
                    size: req.file && req.file.size || "",
                }).save();

                if (createFile) {
                    req.setMessage("تم انشاء الملف بنجاح");
                } else {
                    req.setParams(req.body);
                    req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
                }

                return res.redirect("/dashboard/files/create");
            }

            res.render("admin/files/create", {
                title: "ادارة الملفات - انشاء",
                menuId: "files"
            });
        } catch (error) {
            req.setParams(req.body);
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

            res.redirect("/dashboard/files/create");
        }
    },
    Update: async (req, res, next) => {
        const { userdata } = res.locals;
        const { fileId } = req.params;

        try {
            const file = await FileModel.findOne({
                _id: fileId,
            }).catch(() => { });

            if (!file) {
                req.setMessage("لم يتم العثور على الملف", "warning");

                return res.redirect("/dashboard/files");
            }

            if (req.method == "POST") {
                const { values, errors } = await Validate.File.Create({
                    request: req,
                    source: "body"
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/files/${fileId}/update`);
                }

                const refRequest = await RequestModal.exists({
                    $or: [
                        { deed_land: file.id },
                        { map: file.id },
                        { build_permit: file.id }
                    ]
                });
                
                const refProcedure = await ProcedureModal.exists({
                    files: file.id
                });
    
                if (refRequest || refProcedure) {
                    req.setMessage("لا يمكن تعديل ملف مرتبط بطلب أو اجراء", "warning");
    
                    return res.redirect("/dashboard/files");
                }

                if (req.upload && req.upload.status == false) {
                    req.setParams(req.body);
                    req.setMessage(`- الملف: ${req.upload.message}.`, "warning");

                    return res.redirect(`/dashboard/files/${fileId}/update`);
                }

                if (req.file && file.name) {
                    await Delete(file.name);
                }

                const updateFile = await file.updateOne({
                    title: values.title,
                    description: values.description,
                    ...(req.file && req.file.filename && {
                        name: req.file && req.file.filename || "",
                        mime_type: req.file && req.file.mimetype || "",
                        size: req.file && req.file.size || "",
                    }),
                    updated_at: Date.now().toString()
                });

                if (updateFile) {
                    req.setMessage("تم تعديل الملف بنجاح");
                } else {
                    req.setParams(req.body);
                    req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
                }

                return res.redirect(`/dashboard/files/${fileId}/update`);
            }

            res.render("admin/files/update", {
                title: "ادارة الملفات - تعديل",
                menuId: "files",
                file
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
            res.redirect("/dashboard/files");
        }
    },
    Delete: async (req, res, next) => {
        const { userdata } = res.locals;
        const { fileId } = req.params;

        try {
            const file = await FileModel.findOne({
                _id: fileId
            }).catch(() => { });

            if (!file) {
                req.setMessage("لم يتم العثور على الملف", "warning");

                return res.redirect("/dashboard/files");
            }

            if (req.method == "POST") {
                const { values, errors } = await Validate.File.Delete({
                    request: req,
                    source: "body"
                });

                if (errors) {
                    req.setParams(req.body);
                    req.setMessage(errors, "warning");

                    return res.redirect(`/dashboard/files/${fileId}/delete`);
                }

                const refRequest = await RequestModal.exists({
                    $or: [
                        { deed_land: file.id },
                        { map: file.id },
                        { build_permit: file.id }
                    ]
                });
                
                const refProcedure = await ProcedureModal.exists({
                    files: file.id
                });
    
                if (refRequest || refProcedure) {
                    req.setMessage("لا يمكن تعديل ملف مرتبط بطلب أو اجراء", "warning");
    
                    return res.redirect("/dashboard/files");
                }

                const deleteFile = await file.deleteOne();

                if (deleteFile) {
                    await Delete(file.name);

                    req.setMessage("تم حذف الملف بنجاح");
                } else {
                    req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");
                }

                return res.redirect("/dashboard/files");
            }

            res.render("admin/files/delete", {
                title: "ادارة الملفات - حذف",
                menuId: "files",
                file,
            });
        } catch (error) {
            req.setMessage("حدث خطأ يرجى المحاولة مرة أخرى", "danger");

            res.redirect("/dashboard/files");
        }
    }
}