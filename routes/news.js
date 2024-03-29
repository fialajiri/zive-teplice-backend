const express = require("express");
const { check, body } = require("express-validator");

const { fileUpload } = require("../middleware/file-upload");

const router = express.Router();
const newsController = require("../controllers/news");

const { verifyUser } = require("../authenticate");

router.get("/", newsController.getAllNews);

router.get("/:nid", newsController.getNewsItem);
router.delete("/:nid", newsController.deleteNewsItem);

router.patch(
  "/:nid",
  fileUpload("news").single("image"),
  [
    check("title").isLength({ min: 10, max: 75 }),   
  ],
  newsController.updateNewsItem
);

router.post(
  "/",
  verifyUser,
  fileUpload("news").single("image"),

  [
    check("title").isLength({ min: 10, max: 75 }),    
  ],
  newsController.addNewsItem
);

module.exports = router;
