const Joi = require("joi");
const mongoose = require("mongoose");

const UserModel = require("../models/user");
const RoleModel = require("../models/role");
const FileModel = require("../models/file");

var _request;

const Custom = {
    objectId: async (v, h) => {
        if (!mongoose.Types.ObjectId.isValid(v)) {
            return h.message("- {#label} : يجب أن يحتوي على معرف صحيح.");
        }

        return v;
    },
    mobile: async (v, h) => {
        if (v && !String(v).match(/^(05)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/)) {
            return h.message("- رقم الجوال: يجب أن يكون بالصيغة التالية 05xxxxxxxx.");
        }

        return v;
    },
    unique: (model, columns = null) => async function (v, h) {
        try {
            if (!v) {
                return v;
            }

            let ids = {}, inputs = {};

            columns?.forEach(c => {
                if (c.startsWith("#")) {
                    const name = c.slice(1);
                    ids[name] = name;
                } else {
                    inputs[c] = _request.params[c] || this.state.ancestors[0][c] || null;
                }
            });

            const find = await model.findOne(inputs).catch(() => { });

            const result = Object.values(ids).every(i => {
                if (_request.params[i]) {
                    return find[i] !== _request.params[i];
                }

                return true;
            });

            if (find && result) {
                return h.message("- {#label} : موجود من قبل.");
            }

            return v;
        } catch (error) {
            //console.log(error);
        }
    },
    exist: (m) => async (v, h) => {
        const find = await m.findById(v).catch(() => { });

        if (!find) {
            return h.message("- {#label} : المعرف غير موجود في قاعدة البيانات.");
        }

        if (find && find.status != "نشط") {
            return h.message("- {#label} : غير نشط.");
        }

        return v;
    },
    files: (max = 1) => async (v, h) => {
        const value = v.endsWith(';') ? v.slice(0, -1) : v;
        const _files = value.split(";").filter(Boolean);

        if (_files.length > max) {
            return h.message(`- {#label} : عدد الملفات يجب أن لا يتجاوز ${max} ملف.`);
        }

        const isExist = await FileModel.find({
            _id: { $in: _files }
        }).catch(() => { });


        if (isExist) {
            return _files;
        }

        return h.message("- {#label} : المعرف غير موجود في قاعدة البيانات.");
    }
}

const Validator = (schema) => async ({ request, source, separate = "<br>" }) => {
    return new Promise((resolve, reject) => {
        _request = request;

        return Joi.object(schema).validateAsync(request[source], {
            abortEarly: false,
            errors: {
                wrap: {
                    label: ""
                },
            },
            messages: {
                "any.required": "- {#label} : مطلوب.",
                "string.empty": "- {#label} : مطلوب.",
                "string.alphanum": `- {#label} : يجب أن يحتوي على حروف انجليزية وأرقام فقط.`,
                "string.min": `- {#label} : يجب أن يحتوي على الأقل {#limit} حرف / حروف.`,
                "string.max": `- {#label} : يجب أن لا يتجاوز {#limit} حرف / حروف.`,
                "string.email": "- {#label} : يجب أن يكون عنوان بريد الكتروني صحيح.",
                "boolean.base": `- {#label} : يجب أن يحتوي على قيمة مسموح بها.`,
                "any.only": `- {#label} : يجب أن يحتوي على قيمة مسموح بها.`,
                "number.base": `- {#label} : يجب أن يحتوي على رقم.`,
                "object.unknown": `- {#label} : غير مسموح به`,
            }
        }).then(values => {
            //console.log(values);
            return resolve({ values, errors: null });
        }).catch(({ details }) => {
            //console.log(details);
            return resolve({
                values: null,
                errors: details && details.map(e => e.message).join(separate) || ""
            });
        });
    });
}

module.exports = {
    Login: Validator({
        username: Joi.string().required().label("اسم المستخدم"),
        password: Joi.string().required().label("كلمة المرور")
    }),
    Register: Validator({
        username: Joi.string()
            .required().alphanum().min(4).max(20).trim()
            .external(Custom.unique(UserModel, ["username"]))
            .label("اسم المستخدم"),
        email: Joi.string()
            .required().email().trim()
            .external(Custom.unique(UserModel, ["email"]))
            .label("البريد الالكتروني"),
        full_name: Joi.string()
            .required().regex(/^[\u0621-\u064A\s]+$/).trim().max(50)
            .label("الاسم كامل")
            .messages({
                "string.pattern.base": "- {#label} : يجب أن يحتوى على احرف عربية"
            }),
        mobile: Joi.string()
            .required().trim()
            .external(Custom.mobile)
            .external(Custom.unique(UserModel, ["mobile"]))
            .label("رقم الجوال"),
        password: Joi.string()
            .required().trim().min(8).max(20)
            .label("كلمة المرور"),
        password_confirm: Joi.string()
            .valid(Joi.ref("password")).required()
            .label("تأكيد كلمة المرور")
            .messages({ "any.only": "- كلمة المرور : غير متطابقة" })
    }),
    User: (skipPassword = false) => Validator({
        username: Joi.string()
            .required().alphanum().min(4).max(20).trim()
            .external(Custom.unique(UserModel, ["#id", "userId", "username"]))
            .label("اسم المستخدم"),
        password: skipPassword ?
            Joi.string().allow("").trim().label("كلمة المرور") :
            Joi.string().required().trim().min(8).max(20).label("كلمة المرور"),
        full_name: Joi.string()
            .required().regex(/^[\u0621-\u064A\s]+$/).trim().max(50)
            .label("الاسم كامل")
            .messages({
                "string.pattern.base": "- {#label} : يجب أن يحتوى على احرف عربية"
            }),
        email: Joi.string()
            .required().email().trim()
            .external(Custom.unique(UserModel, ["#id", "userId", "email"]))
            .label("البريد الالكتروني"),
        mobile: Joi.when({
            not: "",
            then: Joi.string()
                .trim()
                .external(Custom.mobile)
                .external(Custom.unique(UserModel, ["#id", "userId", "mobile"]))
                .label("رقم الجوال")
        }),
        provider: Joi.when({
            not: "",
            then: Joi.string()
                .external(Custom.objectId)
                .external(Custom.exist(UserModel))
                .label("مقدم الخدمة")
        }),
        role: Joi.string()
            .required().trim()
            .external(Custom.objectId)
            .external(Custom.exist(RoleModel))
            .label("الصلاحية"),
        status: Joi.string()
            .required().trim().valid("نشط", "معطل")
            .label("حالة المستخدم")
    }),
    Offer: {
        Create: Validator({
            price: Joi.string().required().label("السعر"),
            duration: Joi.number().required().label("المدة"),
            note: Joi.string().allow("").label("ملاحظات"),
        }),
        Update: Validator({
            price: Joi.string().required().label("السعر"),
            duration: Joi.number().required().label("المدة"),
            note: Joi.string().allow("").label("ملاحظات"),
        }),
        Accept: Validator({
            agreement: Joi.string().valid("yes").required().label("تأكيد قبول الطلب")
        }),
        Reject: Validator({
            reason: Joi.string().required().label("سبب الرفض"),
            agreement: Joi.string().valid("yes").required().label("تأكيد رفض الطلب")
        }),
        Delete: Validator({
            agreement: Joi.string().valid("yes").required().label("تأكيد حذف العرض")
        })
    },
    Request: {
        Create: Validator({
            deed_land: Joi.string().required().label("صك الأرض"),
            map: Joi.string().required().label("الكروكي"),
            build_permit: Joi.string().required().label("تصريح البناء"),
            note: Joi.string().allow("").label("ملاحظات"),
        }),
        Update: Validator({
            deed_land: Joi.string().required().label("صك الأرض"),
            map: Joi.string().required().label("الكروكي"),
            build_permit: Joi.string().required().label("تصريح البناء"),
            note: Joi.string().allow("").label("ملاحظات"),
        }),
        Delete: Validator({
            agreement: Joi.string().valid("yes").required().label("تأكيد حذف الطلب")
        })
    },
    Procedure: Validator({
        title: Joi.string().required().label("العنوان"),
        note: Joi.string().required().label("ملاحظات"),
        attachments: Joi.string()
            .required().trim()
            .external(Custom.files(5))
            .label("المرفقات"),
    }),
    ProcedureApprove: Validator({
        note: Joi.string().required().label("ملاحظات"),
        attachments: Joi.string()
            .required().trim()
            .external(Custom.files(5))
            .label("المرفقات"),
        agreement: Joi.string().valid("yes", "no").required().label("صحة الإجراء")
    }),
    File: {
        Create: Validator({
            file: Joi.string().allow("").label("الملف"),
            description: Joi.string().required().trim().max(150).label("وصف الملف"),
        }),
        Delete: Validator({
            agreement: Joi.string().valid("yes").required().label("تأكيد حذف الملف")
        })
    },
    Profile: {
        ChangePassword: Validator({
            old_password: Joi.string()
                .required().trim().min(8).max(20)
                .label("كلمة المرور القديمة"),
            new_password: Joi.string()
                .required().trim().min(8).max(20)
                .label("كلمة المرور الجديدة"),
            new_password_confirm: Joi.string()
                .valid(Joi.ref("password")).required()
                .label("تأكيد كلمة المرور الجديدة")
                .messages({ "any.only": "- كلمة المرور : غير متطابقة" })
        })
    }
}