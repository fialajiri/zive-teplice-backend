const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
  
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        throw new HttpError("Authentication failed");
      }
      const decodedToken = jwt.verify(token, process.env.JWT_KEY);
      console.log(decodedToken);
      req.adminData = { adminId: decodedToken.adminId };
      next();
    } catch (err) {
      const error = new HttpError("Authentication failed", 401);
      return next(error);
    }
  };
}

