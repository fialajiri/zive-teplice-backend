const { validationResult } = require("express-validator");
const User = require("../models/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
} = require("../authenticate");

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Neplatné vstupy, zkontrolujte prosím svá data",
      422
    );

    error.data = errors.array();
    return next(error);
  }

  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    phoneNumber: req.body.phoneNumber,
    description: req.body.description,
    type: req.body.type,
  });

  User.register(newUser, req.body.password, async (err, user) => {
    if (err) {
      console.log(err);
      const error = new HttpError(
        "Registrace se nezdařila, zkuste to znovu",
        500
      );
      return next(error);
    } else {
      const token = getToken({ _id: user._id });
      const refreshToken = getRefreshToken({ _id: user._id });
      user.refreshToken.push({ refreshToken });
      try {
        await user.save();
        res
          .status(201)
          .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
          .send({ success: true, token });
      } catch (err) {
        const error = new HttpError(
          "Registrace uživatele se nezdařila, zkuste to později",
          500
        );
        return next(error);
      }
    }
  });
};

const login = async (req, res, next) => {
  const token = getToken({ _id: req.user.id });
  const refreshToken = getRefreshToken({ _id: req.user._id });

  let userFromDb;

  try {
    userFromDb = await User.findById(req.user._id);
  } catch (err) {
    return next(new HttpError("Přihlášení selhalo, zkusto to znovu.", 500));
  }

  userFromDb.refreshToken.push({ refreshToken });

  try {
    const savedUser = await userFromDb.save();    
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.send({ success: true, token, role: savedUser.role });
  } catch (err) {
    return next(new HttpError("Přihlášení selhalo, zkusto to znovu.", 500));
  }
};

const refreshToken = async (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  

  if (refreshToken) {
    let payload;
    let userFromDb;

    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return next(new HttpError("Ověření uživatele se nezdařilo.", 401));
    }

    const userId = payload._id;
    console.log(userId);

    try {
      userFromDb = await User.findById({ _id: userId });
    } catch (err) {
      return next(
        new HttpError("Nepodařilo se najíž uživatele v databázi", 401)
      );
    }

    // Find the refresh token against the user record in database
    const tokenIndex = userFromDb.refreshToken.findIndex(
      (item) => item.refreshToken === refreshToken
    );

    if (tokenIndex === -1) {
      return next(new HttpError("Ověření uživatele se nezdařilo.", 401));
    }

    const token = getToken({ _id: userId });
    // If the refresh token exists, then create new one and replace it.

    const newRefreshToken = getRefreshToken({ _id: userId });
    userFromDb.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };

    try {
      await userFromDb.save();
      res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
      res.send({ success: true, token, role:userFromDb.role });
    } catch (err) {
      new HttpError("Nepodařilo se uložit token v databázi", 500);
    }
  } else {
    return next(new HttpError("Ověření uživatele se nezdařilo.", 401));
  }
};

const me = (req, res, next) => {
  res.send(req.user);
};

const logout = async (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  

  let userFromDb;

  try {
    userFromDb = await User.findById(req.user._id);
  } catch (err) {
    new HttpError("Nepodařilo se najít uživatele v databázi", 401);
  }

  const tokenIndex = userFromDb.refreshToken.findIndex(
    (item) => item.refreshToken === refreshToken
  );

  if (tokenIndex !== -1) {
    userFromDb.refreshToken
      .id(userFromDb.refreshToken[tokenIndex]._id)
      .remove();
  }

  try {
    await userFromDb.save();
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.send({ success: true });
  } catch (err) {
    return next(
      new HttpError("Nepodařilo se uložit uživatele v databázi", 401)
    );
  }
};

exports.logout = logout;
exports.me = me;
exports.refreshToken = refreshToken;
exports.login = login;
exports.signUp = signUp;
