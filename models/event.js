const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },
    current: { type: Boolean, required: true },
    program: {type: Schema.Types.ObjectId, ref: "Program"}
  },
 
);

module.exports = mongoose.model("Event", eventSchema);
