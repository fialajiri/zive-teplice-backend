const { validationResult } = require("express-validator");
const { deleteImage } = require("../middleware/file-upload");
const Gallery = require("../models/gallery");
const mongoose = require("mongoose");

const getAllGalleries = async (req, res, next) => {
  let galleries;

  try {
    galleries = await Gallery.find();
  } catch (err) {
    return next(HttpError("Načítání galirií selhalo, zkuste to později", 500));
  }

  res
    .status(200)
    .json({ galleries: galleries.map((n) => n.toObject({ getters: true })) });
};

const getGallery = async(req, res, next) => {
  const galleryId = req.params.gid;

  let galleryFromDb;

  try {
    galleryFromDb = await Gallery.findById(galleryId);
  } catch (err) {
    return next(new HttpError("Nepodařilo se najít galerii pro dané id"));
  }

  if (!galleryFromDb) {
    return next(new HttpError("Nepodařilo se najít aktualitu pro dané id"));
  }

  res.status(201).json({ gallery: galleryFromDb.toObject({ getters: true }) });
};

const deleteGallery = async(req, res, next) => {
  const galleryId = req.params.gid;

  let galleryFromDb;

  try {
    galleryFromDb = await Gallery.findById(galleryId);
  } catch (err) {
    return next(new HttpError("Něco se pokazilo, nelze najít aktualitu.", 500));
  }

  if (!galleryFromDb) {
    return next(new HttpError("Nelze najít aktualitu pro toto id", 404));
  }

  try {
    const currentSession = await mongoose.startSession();
    currentSession.startTransaction();
    await galleryFromDb.remove({ session: currentSession });
    currentSession.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Něco se pokazilo, aktualitu nelze odstranit.", 500)

    );
  }

  galleryFromDb.images.forEach((image) => deleteImage(image.imageKey));

  deleteImage(galleryFromDb.featuredImage.imageKey);

  res.status(200).json({ message: "Galerie odstraněna" });
};

const createGallery = async (req, res, next) => {
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

  console.log(req.body);

  const newGallery = new Gallery({
    name: req.body.name,
    featuredImage: {
      imageUrl: req.file.location,
      imageKey: req.file.key,
    },
  });

  try {
    await newGallery.save();
  } catch (err) {
    return next(
      new HttpError(
        "Vytváření nové galerie selhalo, prosím zkuste to znovu",
        500
      )
    );
  }

  res.status(201).send({ success: true });
};

const uploadGallery = async (req, res, next) => {
  if (req.files === undefined) {
    res.json({ error: "Error: No file selected" });
  } else {
    const galleryId = req.params.gid;

    let galleryFromDb;

    try {
      galleryFromDb = await Gallery.findById(galleryId);
    } catch {
      return next(new HttpError("Něco se pokazilo, nelze najít galerii.", 500));
    }

    const fileArray = req.files;
    fileArray.forEach((element) => {
      const image = {
        imageUrl: element.location,
        imageKey: element.key,
      };
      galleryFromDb.images.push(image);
    });

    try {
      await galleryFromDb.save();
    } catch (err) {
      return next(
        new HttpError("Nahrání fotek se nezdařilo, prosím zkuste to znovu.")
      );
    }

    res.status(200).json({ success: "true" });
  }
};

exports.getAllGalleries = getAllGalleries;
exports.getGallery = getGallery;
exports.deleteGallery = deleteGallery;
exports.uploadGallery = uploadGallery;
exports.createGallery = createGallery;
