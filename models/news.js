const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsSchema = new Schema({
  date: { type: Date, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  message: { type: String, required: true },
  image: {
    imageUrl: { type: String },
    imageKey: { type: String },
  },
});

module.exports = mongoose.model("News", newsSchema);
