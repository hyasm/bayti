const express = require("express");

const { Upload } = require("../utils");

const router = express.Router();

const Controller = require("../controllers/providers/index");
const Requests = require("../controllers/providers/requests");
const Offers = require("../controllers/providers/offers");
const Procedures = require("../controllers/providers/procedures");
const Files = require("../controllers/files");

router.route("/").get(Controller.Index);
router.route("/requests").get(Requests.Index);
router.route("/requests/:requestId").get(Requests.View);

router.route("/offers/:requestId").get(Offers.Index);
router.route("/offers/:requestId/create").get(Offers.Create).post(Offers.Create);
router.route("/offers/:requestId/:offerId").get(Offers.View);
router.route("/offers/:requestId/:offerId/update").get(Offers.Update).post(Offers.Update);
router.route("/offers/:requestId/:offerId/delete").get(Offers.Delete).post(Offers.Delete);

router.route("/procedures/:requestId").get(Procedures.Index);
router.route("/procedures/:requestId/create").get(Procedures.Create).post(Procedures.Create);
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