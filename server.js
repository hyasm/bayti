const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const layouts = require("express-ejs-layouts");
const mongoStore = require("connect-mongo");

global.APP_PATH = __dirname;

const { Database, Locals } = require("./utils");

Database();

const app = express();

app.set("view engine", "ejs");
app.set("layout", "layouts/index");
app.set("views", path.join(APP_PATH, "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(APP_PATH, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new mongoStore({
        mongoUrl: process.env.DATABASE_URL
    }),
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
app.use(layouts);
app.use(Locals);

app.use("/", require("./routes/main"));
app.use("/dashboard", async (req, res, next) => {
    const { userdata } = res.locals;

    const role = userdata && userdata.role.type;

    if (role === "admin") {
        return require("./routes/admin")(req, res, next);
    } else if (role === "provider") {
        return require("./routes/provider")(req, res, next);
    } else if (role === "validator") {
        return require("./routes/validator")(req, res, next);
    } else if (role === "user") {
        return require("./routes/user")(req, res, next);
    } else {
        res.redirect("/login");
    }
});

app.all("*", (req, res, next) => {
    return res.render("error", {
        menuId: "",
        title: "لم يتم العثور على الصفحة",
        errorTitle: "لم يتم العثور على الصفحة",
        errorContent: "الصفحة التي تبحث عنها ربما تم حذفها أو الرابط الذي تحاول الوصول اليه غير صحيح."
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server Running: ${process.env.HOST}:${process.env.PORT}`)
});