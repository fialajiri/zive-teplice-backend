const express = require("express");
const { check, body } = require("express-validator");

const { fileUpload, galleryUploadS3 } = require("../middleware/file-upload");

const router = express.Router();

const galleryControllers = require("../controllers/gallery");

const { verifyUser } = require("../authenticate");
const { checkRole } = require("../middleware/check-role");

router.get('/', galleryControllers.getAllGalleries)
router.get('/:gid', galleryControllers.getGallery)
router.delete('/:gid', galleryControllers.deleteGallery)

router.post(
  "/",
  verifyUser,
  checkRole,
  fileUpload("Gallery").single("image"),
  [check("name").isLength({ min: 4, max: 15 })],
  galleryControllers.createGallery
);
router.post(
  "/:gid",
  verifyUser,
  checkRole,
  galleryUploadS3("Gallery"),
  galleryControllers.uploadGallery
);

module.exports = router;
