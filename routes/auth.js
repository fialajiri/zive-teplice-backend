const express = require("express");
const { check, body } = require("express-validator");
const passport = require("passport");

const router = express.Router();
const User = require("../models/user");
const authControllers = require("../controllers/auth");

const {verifyUser} = require("../authenticate");

router.post(
  "/signup",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject(
            "Tota emailová adresa je již v databázi, zkuste se přihlásit"
          );
        }
      }),
    check("password").isLength({ min: 8 }).trim(),
    check("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Hesla se musí shodovat");
        }
        return true;
      })
      .trim(),
    check("username")
      .trim()
      .not()
      .isEmpty()
      .custom(async (value) => {
        
        const user = await User.findOne({ username: value });
        if (user) {
          return Promise.reject(
            "Toto uživatelské jméno již existuje, vyberte prosím jiné."
          );
        } 
      }),
    check("phoneNumber").isLength({ min: 9 }).isNumeric(),
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

  authControllers.signUp
);

router.post("/login", passport.authenticate("local"), authControllers.login);
router.post('/refreshToken', authControllers.refreshToken)
router.get('/me', verifyUser, authControllers.me)
router.get('/logout', verifyUser, authControllers.logout);

module.exports = router;
