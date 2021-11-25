const express = require("express");
const { check, body } = require("express-validator");
const passport = require("passport");

const router = express.Router();
const User = require("../models/user");
const userControllers = require("../controllers/users.js");

const { verifyUser } = require("../authenticate");


// router.get('/', userControllers.getAllUsers)

router.get('/:uid', userControllers.getUser)

// router.delete('/:uid', userControllers.deleteUser)

// router.patch('/:uid', userControllers.updateUser)

module.exports = router;