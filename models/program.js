const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const programSchema = new Schema(
  {
    title: { type: String, required: true },    
    message: { type: String},
    image: {
        imageUrl: { type: String },
        imageKey: { type: String },
      },

  },
  
);

module.exports = mongoose.model("Program", programSchema);