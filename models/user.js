const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const Session = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
});

const User = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String },
  authStrategy: { type: String, default: "local" },
  refreshToken: { type: [Session] },
  phoneNumber: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  role: { type: String, default: "user" },
  //   image: {
  //     imageUrl: { type: String, required: true },
  //     imageKey: { type: String, required: true },
  //   },
  verified: {
    status: { type: Boolean, default: "false" },
    Token: { type: String },
    ExpirationDate: { type: Date },
  },
  //   reset: {
  //     Token: { type: String },
  //     TokenExpiration: { type: Date },
  //   },
});

User.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.refreshToken;
    return ret;
  },
});

User.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model("User", User);
