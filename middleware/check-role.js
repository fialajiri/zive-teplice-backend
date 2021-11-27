const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const checkRole = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    return next(new HttpError("Pro tuto operaci nemáte oprávnění", 401));
  }
};

exports.checkRole = checkRole


