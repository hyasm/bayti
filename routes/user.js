const express = require("express");

const { Upload } = require("../utils");

const router = express.Router();

const Controller = require("../controllers/users/index");
const Requests = require("../controllers/users/requests");
const Offers = require("../controllers/users/offers");
const Procedures = require("../controllers/users/procedures");
const Files = require("../controllers/files");

router.route("/").get(Controller.Index);

router.route("/requests").get(Requests.Index);
router.route("/requests/create").get(Requests.Create).post(Requests.Create);
router.route("/requests/:requestId").get(Requests.View);
router.route("/requests/:requestId/update").get(Requests.Update).post(Requests.Update);
router.route("/requests/:requestId/delete").get(Requests.Delete).post(Requests.Delete);

router.route("/offers/:requestId").get(Offers.Index);
router.route("/offers/:requestId/:offerId").get(Offers.View);
router.route("/offers/:requestId/:offerId/accept").get(Offers.Accept).post(Offers.Accept);
router.route("/offers/:requestId/:offerId/reject").get(Offers.Reject).post(Offers.Reject);

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