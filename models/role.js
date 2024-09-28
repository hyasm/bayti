const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    type: String,
    system: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["معطل", "نشط"],
        default: "نشط"
    },
    created_at: { type: String, default: () => Date.now().toString() },
    updated_at: String,
    deleted_at: String
});

module.exports = mongoose.model("roles", RoleSchema);

module.exports.List = {
    resources: [
        { name: "entities", title: "ادارة الجهات", perms: ["view", "viewAll", "create", "update", "delete"] },
        { name: "services", title: "ادارة الخدمات", perms: ["viewAll", "create", "update", "delete"] },
        { name: "incidents", title: "ادارة البلاغات", perms: ["view", "viewAll", "close", "approve-close", "transfer", "update-service", "view-attachments"] },
        { name: "situations", title: "ادارة الحالات", perms: ["viewAll", "create", "update", "delete"] },
        { name: "users", title: "ادارة المستخدمين", perms: ["view", "viewAll", "create", "update", "delete"] },
        { name: "roles", title: "ادارة الصلاحيات", perms: ["viewAll", "create", "update", "delete"] },
        { name: "pages", title: "ادارة الصفحات", perms: ["viewAll", "create", "update", "delete"] },
        { name: "news", title: "ادارة الأخبار", perms: ["viewAll", "create", "update", "delete"] },
        { name: "templates", title: "ادارة القوالب", perms: ["viewAll", "create", "update", "delete"] },
        { name: "carousels", title: "ادارة الشرائح", perms: ["viewAll", "create", "update", "delete"] },
        { name: "files", title: "ادارة الملفات", perms: ["viewAll", "create", "update", "delete"] },
        { name: "transactions", title: "ادارة الحركات", perms: ["viewAll"] },
        { name: "settings", title: "الاعدادات العامة", perms: ["view", "update"] },
        { name: "email", title: "اعدادات البريد الالكتروني", perms: ["view", "update"] }
    ],
    columns: [
        { name: "view", title: "عرض" },
        { name: "viewAll", title: "عرض الكل" },
        { name: "create", title: "اضافة" },
        { name: "update", title: "تحديث" },
        { name: "delete", title: "حذف" },
        { name: "close", title: "اغلاق" },
        { name: "approve-close", title: "تأكيد الاغلاق" },
        { name: "transfer", title: "تحويل الى جهة" },
        { name: "update-service", title: "تغير الخدمة" },
        { name: "view-attachments", title: "عرض المرفقات" },
    ]
}