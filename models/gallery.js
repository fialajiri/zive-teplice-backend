const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gallerySchema = new Schema(
  {
    name: { type: String },
    featuredImage: {
      imageUrl: { type: String },
      imageKey: { type: String },
    },
    images: [
      {
        imageUrl: { type: String },
        imageKey: { type: String },
      },
    ],
  },
  { timestamps: {} }
);

module.exports = mongoose.model("Gallery", gallerySchema);
