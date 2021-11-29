const express = require("express");
const { check, body } = require("express-validator");

const router = express.Router();
const eventController = require("../controllers/event");

const { verifyUser } = require("../authenticate");
const { checkRole } = require("../middleware/check-role");
const { fileUpload } = require("../middleware/file-upload");

router.post(
  "/",
    verifyUser,
    checkRole,
  [
    check("title").trim().isLength({ min: 10, max: 100 }),
    check("year").isNumeric().isLength({ min: 4, max: 4 }),
  ],
  eventController.createEvent
);
router.get("/", eventController.getEvents);
router.get("/current", eventController.getCurrent);
router.delete("/:eid", verifyUser, checkRole, eventController.deleteEvent);
router.patch("/eid", verifyUser, checkRole, eventController.updateEvent);

router.post(
  "/program/:eid",
  verifyUser,
  checkRole,
  fileUpload("program").single("image"),
  [check("title").trim().isLength({ min: 10, max: 100 })],
  eventController.addProgram
);

router.patch(
  "/program/:eid",
  verifyUser,
  checkRole,
  fileUpload("program").single("image"),
  [check("title").trim().isLength({ min: 10, max: 100 })],
  eventController.updateProgram
);

module.exports = router;
