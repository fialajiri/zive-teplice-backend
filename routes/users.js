const express = require("express");
const { check, body } = require("express-validator");
const passport = require("passport");
const { fileUpload } = require("../middleware/file-upload");

const router = express.Router();
const User = require("../models/user");
const userControllers = require("../controllers/users.js");

const { verifyUser } = require("../authenticate");
const { checkRole } = require("../middleware/check-role");

router.post("/request/:uid", verifyUser, userControllers.requestEvent);

router.patch(
  "/request/:uid",
  verifyUser,
  checkRole,
  userControllers.updateRequest
);

router.get("/", userControllers.getAllUsers);

router.get("/:uid", userControllers.getUser);

router.delete("/:uid", verifyUser, userControllers.deleteUser);

router.patch(
  "/:uid",
  verifyUser,
  fileUpload("users").single("image"),
  [
    check("username")
      .trim()
      .not()
      .isEmpty()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ username: value });
        if (user && user.id.toString() !== req.params.uid) {
          return Promise.reject(
            "Toto uživatelské jméno již existuje, vyberte prosím jiné."
          );
        }
      }),
    check("phoneNumber").isLength({ min: 9 }),
    check("description").isLength({ min: 150, max: 350 }),
    check("type")
      .isLength({ min: 6, max: 9 })
      .custom((value) => {
        if (!(value === "prodejce" || value === "umělec")) {
          return Promise.reject("Špatná hodnota parametru");
        } else {
          return true;
        }
      }),
  ],
  userControllers.updateUser
);

module.exports = router;
