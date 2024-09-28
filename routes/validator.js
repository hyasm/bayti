const express = require("express");

const { Upload } = require("../utils");

const router = express.Router();

const Controller = require("../controllers/validators/index");
const Requests = require("../controllers/validators/requests");
const Procedures = require("../controllers/validators/procedures");
const Files = require("../controllers/files");

router.route("/").get(Controller.Index);
router.route("/requests").get(Requests.Index);
router.route("/requests/:requestId").get(Requests.View);

router.route("/procedures/:requestId").get(Procedures.Index);
router.route("/procedures/:requestId/:procedureId/approve").get(Procedures.Approve).post(Procedures.Approve);
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