const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const News = require("../models/news");
const User = require("../models/user");
const mongoose = require("mongoose");

const { deleteImage } = require("../middleware/file-upload");

const addNewsItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Neplatné vstupy, zkontrolujte prosím svá data",
      422
    );

    error.data = errors.array();
    return next(error);
  }

  if (req.user.role !== "admin") {
    return next(
      new HttpError("Pro přidání aktuality nemáte platné oprávnění", 401)
    );
  }

  const newNewsItem = new News({
    title: req.body.title,
    abstract: req.body.abstract,
    message: req.body.message,
    date: req.body.date,
    image: {
      imageUrl: req.file.location,
      imageKey: req.file.key,
    },
  });

  try {
    await newNewsItem.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Vytváření aktuality selhalo, prosím zkuste to znovu", 500)
    );
  }

  res.status(201).send({ success: true });
};

const getAllNews = async (req, res, next) => {
  let news;

  try {
    news = await News.find();
  } catch (err) {
    return next(HttpError("Načítání aktualit selhalo, zkuste to později", 500));
  }

  res
    .status(201)
    .json({ news: news.map((n) => n.toObject({ getters: true })) });
};

const getNewsItem = async (req, res, next) => {
  try {
    newsItem = await News.findById(req.params.nid);
  } catch (err) {
    return next(new HttpError("Nepodařilo se najít aktualitu pro dané id"));
  }

  if (!newsItem) {
    return next(new HttpError("Nepodařilo se najít aktualitu pro dané id"));
  }

  res.status(201).json({ news: newsItem.toObject({ getters: true }) });
};

const deleteNewsItem = async (req, res, next) => {
  const newsId = req.params.nid;

  let news;

  try {
    news = await News.findById(newsId);
  } catch (err) {
    return next(new HttpError("Něco se pokazilo, nelze najít aktualitu.", 500));
  }

  if (!news) {
    return next(new HttpError("Nelze najít aktualitu pro toto id", 404));
  }

  const imageKey = news.image.imageKey;
  

  try {
    const currentSession = await mongoose.startSession();
    currentSession.startTransaction();
    await news.remove({ session: currentSession });
    currentSession.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Něco se pokazilo, aktualitu nelze odstranit.", 500)
    );
  }

  deleteImage(imageKey);

  res.status(200).json({ message: "Aktualita odstraněna" });
};
const updateNewsItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Neplatné vstupy, zkontrolujte prosím svá data",
      422
    );
    error.data = errors.array();
    return next(error);
  }

  const newsId = req.params.nid;
  const { title, abstract, message } = req.body;

  let newsFromDb;

  try {
    newsFromDb = await News.findById(newsId);
  } catch (err) {
    return next(new HttpError("Něco se pokazilo, nelze najít aktualitu.", 500));
  }

  newsFromDb.title = title;
  newsFromDb.abstract = abstract;
  newsFromDb.message = message;

  if (req.file) {
    newsFromDb.image.imageUrl = req.file.location;
    newsFromDb.image.imageKey = req.file.key;
  }

  try {
    await newsFromDb.save();
  } catch (err) {
    return next(
      new HttpError("Změna aktuality selhala, prosím zkuste to znovu.")
    );
  }

  res.status(200).json({ news: newsFromDb.toObject({ getters: true }) });
};

exports.addNewsItem = addNewsItem;
exports.getAllNews = getAllNews;
exports.getNewsItem = getNewsItem;
exports.deleteNewsItem = deleteNewsItem;
exports.updateNewsItem = updateNewsItem;
