const mongoose = require("mongoose");

const mongoDbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oahmw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const connect = mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })

connect
  .then((db) => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
