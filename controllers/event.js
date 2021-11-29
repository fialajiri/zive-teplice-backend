const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Program = require("../models/program");
const Event = require("../models/event");
const User = require("../models/user");
const mongoose = require("mongoose");

const { deleteImage } = require("../middleware/file-upload");

const createEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Neplatné vstupy, zkontrolujte prosím svá data",
      422
    );

    error.data = errors.array();
    return next(error);
  }

  let lastEvent;

  try {
    lastEvent = await Event.findOne({ current: "true" });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Vytváření eventu selhalo, prosím zkuste to znovu", 500)
    );
  }

  if (lastEvent) {
    try {
      lastEvent.current = false;
      await lastEvent.save();
    } catch (err) {
      return next(
        new HttpError("Vytváření eventu selhalo, prosím zkuste to znovu", 500)
      );
    }
  }

  const newEvent = new Event({
    title: req.body.title,
    year: req.body.year,
    current: true,
  });

  try {
    await newEvent.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Vytváření eventu selhalo, prosím zkuste to znovu", 500)
    );
  }

  let users;

  try {
    users = await User.find();
    users.forEach(async (user) => {
      user.request = "notsend";
      await user.save();
    });
  } catch (err) {
    console.log(err);
  }

  res.status(201).send({ success: true });
};

const getEvents = async (req, res, next) => {
  let events;

  try {
    events = await Event.find();
  } catch (err) {
    return next(HttpError("Načítání eventů selhalo, zkuste to později", 500));
  }

  res
    .status(200)
    .json({ events: events.map((n) => n.toObject({ getters: true })) });
};

const getCurrent = async (req, res, next) => {
  let currentEvent;

  try {
    currentEvent = await Event.findOne({ current: "true" }).populate("program");
  } catch (err) {
    return next(HttpError("Načítání eventu selhalo, zkuste to později", 500));
  }

  if (!currentEvent) {
    return res.status(200).json({ event: [] });
  }

  res.status(200).json({ event: currentEvent.toObject({ getters: true }) });
};

const deleteEvent = async (req, res, next) => {
  const eventId = req.params.eid;

  let event;

  try {
    event = await Event.findById(eventId);
  } catch (err) {
    return next(
      new HttpError("Načítání eventů selhalo, zkuste to později.", 500)
    );
  }

  if (!event) {
    return next(new HttpError("Nelze najít event pro toto id", 404));
  }

  try {
    const currentSession = await mongoose.startSession();
    currentSession.startTransaction();
    await event.remove({ session: currentSession });
    currentSession.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Něco se pokazilo, event nelze odstranit.", 500));
  }

  res.status(200).json({ message: "Event odstraněn" });
};

const updateEvent = async (req, res, next) => {
  return next();
};

const addProgram = async (req, res, next) => {
  const eventId = req.params.eid;

  let newProgram = new Program({
    title: req.body.title,
    message: req.body.message,
    image: {
      imageUrl: req.file.location,
      imageKey: req.file.key,
    },
  });

  const event = await Event.findById(eventId);

  event.program = newProgram;

  const savedEvent = await event.save();
  await newProgram.save();

  res.status(200).json({ event: savedEvent });
};

const updateProgram = async (req, res, next) => {
  const eventId = req.params.eid;

  let eventFromDb;
  let eventProgram;

  try {
    eventFromDb = await Event.findById(eventId).populate("program");
    eventProgram = await Program.findById(eventFromDb.program.id.toString());
  } catch (err) {
    return next(
      new HttpError("Načítání eventu selhalo, zkuste to později.", 500)
    );
  }

  eventProgram.title = req.body.title;
  eventProgram.message = req.body.message;

  if (req.file) {
    const imageKey = eventProgram.image.imageKey;
    deleteImage(imageKey);

    eventProgram.image.imageUrl = req.file.location;
    eventProgram.image.imageKey = req.file.key;
  }

  try {
    await eventProgram.save();
  } catch (err) {
    return next(
      new HttpError("Změna programu selhala, prosím zkuste to znovu.")
    );
  }

  res.status(200).json({ success: true });
};

exports.updateProgram = updateProgram;
exports.addProgram = addProgram;
exports.createEvent = createEvent;
exports.getEvents = getEvents;
exports.getCurrent = getCurrent;
exports.deleteEvent = deleteEvent;
exports.updateEvent = updateEvent;
