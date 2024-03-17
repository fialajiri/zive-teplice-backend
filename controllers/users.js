const { validationResult } = require("express-validator");
const User = require("../models/user");
const Event = require("../models/event");

const HttpError = require("../models/http-error");
const { deleteImage } = require("../middleware/file-upload");
const { sendEmail } = require("../utils/send-email");

const getAllUsers = async (req, res, next) => {
  let allUsers;

  try {
    allUsers = await User.find({ role: "user" });
  } catch (err) {
    return next(
      new HttpError("Načítání uživatelů selhalo, zkuste to později.", 500)
    );
  }

  res
    .status(200)
    .json({ users: allUsers.map((user) => user.toObject({ getters: true })) });
};

const getUser = async (req, res, next) => {
  const userId = req.params.uid;
  let userFromDb;

  try {
    userFromDb = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("Načítání uživatele selhalo, zkuste to později.", 500)
    );
  }

  if (!userFromDb) {
    return next(
      new HttpError("Nepodařilo se najít uživatele pro dané id.", 404)
    );
  }

  res.status(200).json({ user: userFromDb.toObject({ getters: true }) });
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;
  let userFromDb;  
  
  const isAuth = (req.user.role === "admin" || req.user._id.toString() === userId)
  

  if (!isAuth) {
    return next(new HttpError("Pro tuto operaci nemáte oprávnění.", 401));
  }

  try {
    userFromDb = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("Načítání uživatele selhalo, zkuste to později.", 500)
    );
  }

  if (!userFromDb) {
    return next(
      new HttpError("Nepodařilo se najít uživatele pro dané id.", 404)
    );
  }

  const imageKey = userFromDb.image.imageKey;

  try {
    await userFromDb.remove();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Něco se pokazilo, zastupitele nelze smazat", 500)
    );
    
  }

  deleteImage(imageKey);

  res.status(200).json({ message: "Uživatel smazán" });
};

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError(
      "Neplatné vstupy, zkontrolujte prosím svá data",
      422
    );
    error.data = errors.array();
    return next(error);
  }

  const isAuth = req.user.role === "admin" || req.user.id == req.params.uid;

  if (!isAuth) {
    return next(new HttpError("Pro tuto operaci nemáte oprávnění.", 401));
  }

  const userId = req.params.uid;
  const { username, phoneNumber, description, type, request } = req.body;

  let userFromDb;

  try {
    userFromDb = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("Načítání uživatele selhalo, zkuste to později.", 500)
    );
  }

  if (!userFromDb) {
    return next(
      new HttpError("Nepodařilo se najít uživatele pro dané id.", 404)
    );
  }

  if (req.file) {
    userFromDb.image.imageUrl = req.file.location;
    userFromDb.image.imageKey = req.file.key;
  }

  userFromDb.username = username;
  userFromDb.phoneNumber = phoneNumber;
  userFromDb.description = description;
  userFromDb.type = type;
  userFromDb.request = request;

  try {
    userFromDb = await userFromDb.save();
  } catch (err) {
    return next(
      new HttpError("Aktualizace uživatele selhala, zkuste to znovu.")
    );
  }

  res.status(200).json({ user: userFromDb.toObject({ getters: true }) });
};

const requestEvent = async (req, res, next) => {
  const userId = req.params.uid;

  let userFromDb;

  if (userId !== req.user._id.toString()) {
    return next(new HttpError("Pro tuto operaci nemáte oprávnění.", 401));
  }

  try {
    userFromDb = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("Načítání uživatele selhalo, zkuste to později.", 500)
    );
  }

  if (!userFromDb) {
    return next(
      new HttpError("Nepodařilo se najít uživatele pro dané id.", 404)
    );
  }

  userFromDb.request = "pending";

  try {
    userFromDb = await userFromDb.save();
  } catch (err) {
    return next(
      new HttpError("Požadavek na registraci selhal, zkuste to znovu.")
    );
  }

  res
    .status(201)
    .json({ success: true, user: userFromDb.toObject({ getters: true }) });
};

const updateRequest = async (req, res, next) => {
  const userId = req.params.uid;
  const requestVal = req.body.request;

  let userFromDb;

  try {
    userFromDb = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError("Načítání uživatele selhalo, zkuste to později.", 500)
    );
  }

  if (!userFromDb) {
    return next(
      new HttpError("Nepodařilo se najít uživatele pro dané id.", 404)
    );
  }

  userFromDb.request = requestVal;

  try {
    userFromDb = await userFromDb.save();
  } catch (err) {
    return next(
      new HttpError("Požadavek na registraci selhal, zkuste to znovu.")
    );
  }

  if (requestVal === "rejected") {
    email = `<p></p>Je nám líto, ale Vaše přihláška na Živé Teplice byla zamítnuta.</p></p>S pozdravem tým Živých Teplic.</p>`;
  } else {
    email = `<p></p>Gratulujeme, Vaše přihláška na Živé Teplice byla schálena.</p></p>S pozdravem tým Živých Teplic.</p>`;
  }

  try {    
    sendEmail(userFromDb.email, "Přihláška na Živé Teplice", email);
  } catch (err) {
    console.log(err);
  }

  res
    .status(201)
    .json({ success: true, user: userFromDb.toObject({ getters: true }) });
};

exports.updateRequest = updateRequest;
exports.requestEvent = requestEvent;
exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.updateUser = updateUser;
