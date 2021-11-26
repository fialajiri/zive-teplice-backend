const { validationResult } = require("express-validator");
const User = require("../models/user");

const HttpError = require("../models/http-error");
const {deleteImage} = require('../middleware/file-upload')

const getAllUsers = async (req, res, next) => {
  let allUsers;

  try {
    allUsers = await User.find({role: 'user'});
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

  if (req.user.role !== 'admin'){
    return next(
      new HttpError("Pro tuto operaci nemáte oprávnění.", 401)
    );
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
    const error = new HttpError(
      "Neplatné vstupy, zkontrolujte prosím svá data",
      422
    );
    error.data = errors.array();
    return next(error);
  }

  const isAuth = (req.user.role === 'admin' || req.user.id == req.params.uid)

  if (!isAuth){
    return next(
      new HttpError("Pro tuto operaci nemáte oprávnění.", 401)
    );
  }

  const userId = req.params.uid;
  const {username, phoneNumber, description, type} = req.body;

  let userFromDb;

  try {
    userFromDb = await User.findById(userId);

  } catch (err){
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
    newsFromDb.image.imageUrl = req.file.location;
    newsFromDb.image.imageKey = req.file.key;
  }

  userFromDb.username = username;
  userFromDb.phoneNumber = phoneNumber;
  userFromDb.description = description;
  userFromDb.type = type;

  

  try {
    userFromDb = await userFromDb.save();
  } catch (err){
    return next(
      new HttpError("Aktualizace uživatele selhala, zkuste to znovu.")
    );
  }

  res.status(200).json({ user: userFromDb.toObject({ getters: true }) });

};

exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.updateUser = updateUser;
