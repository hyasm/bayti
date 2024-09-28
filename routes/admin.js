const express = require("express");

const { Upload } = require("../utils");

const router = express.Router();

const Controller = require("../controllers/admin/index");
const Requests = require("../controllers/admin/requests");
const Offers = require("../controllers/admin/offers");
const Procedures = require("../controllers/admin/procedures");
const Users = require("../controllers/admin/users");
const Files = require("../controllers/admin/files");

router.route("/").get(Controller.Index);

router.route("/requests").get(Requests.Index);
router.route("/requests/:requestId").get(Requests.View);
router.route("/requests/:requestId/update").get(Requests.Update).post(Requests.Update);
router.route("/requests/:requestId/delete").get(Requests.Delete).post(Requests.Delete);

router.route("/users").get(Users.Index);
router.route("/users/create").get(Users.Create).post(Users.Create);
router.route("/users/:userId").get(Users.View);
router.route("/users/:userId/update").get(Users.Update).post(Users.Update);
router.route("/users/:userId/delete").get(Users.Delete).post(Users.Delete);


router.route("/offers/:requestId").get(Offers.Index);
router.route("/offers/:requestId/:offerId").get(Offers.View);

router.route("/procedures/:requestId").get(Procedures.Index);
router.route("/procedures/:requestId/:procedureId").get(Procedures.View);
router.route("/procedures/:requestId/:procedureId/review").get(Procedures.Review);

router.route("/files").get(Files.Index);
router.route("/files/list").get(Files.List);
router.route("/files/create").get(Files.Create).post([Upload.single("file")], Files.Create);
router.route("/files/upload").post([Upload.single("file")], Files.Upload);
router.route("/files/:fileId").get(Files.View);
router.route("/files/:fileId/update").get(Files.Update).post([Upload.single("file")], Files.Update);
router.route("/files/:fileId/delete").get(Files.Delete).post(Files.Delete);

module.exports = router;