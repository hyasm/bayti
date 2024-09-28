const express = require("express");

const router = express.Router();

const Main = require("../controllers/main");
const Profile = require("../controllers/profile");
const Login = require("../controllers/auth/login");
const Register = require("../controllers/auth/register");
const Forgot = require("../controllers/auth/forgot");
const Logout = require("../controllers/auth/logout");

router.route("/").get(Main.Index);

router.route("/setup").get(Main.Setup);

router.route("/profile").get(Profile.Index);
router.route("/profile/:userId").get(Profile.Index);
router.route("/profile/change-password").post(Profile.ChangePassword);

router.route("/login").get(Login.Index).post(Login.Submit);
router.route("/register").get(Register.Index).post(Register.Submit);
router.route("/forgot").get(Forgot.Index).post(Forgot.Submit);
router.route("/logout").get(Logout.Index);

module.exports = router;