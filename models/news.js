const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsSchema = new Schema(
  {
    title: { type: String, required: true },    
    message: { type: String},
    image: {
      imageUrl: { type: String },
      imageKey: { type: String },
    },
  },
  { timestamps: {  } }  
);

module.exports = mongoose.model("News", newsSchema);
