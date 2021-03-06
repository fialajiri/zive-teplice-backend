const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const multer = require("multer");
var upload = multer();

const HttpError = require("./models/http-error");

require("./utils/connectdb");

require("./strategies/JWTStrategy");
require("./strategies/LocalStrategy");
require("./authenticate");

const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/event");
const galleryRoutes = require("./routes/gallery");

const app = express();

app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/uploads/images", express.static(path.join("uploads", "images")));

var corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/news", newsRoutes);
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/gallery", galleryRoutes);

app.use(helmet());

app.use((req, res, next) => {
  const error = new HttpError("Cesta nenalezena.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500).json({
    message: error.message || "An unknown error has occured!!!",
    data: error.data || "",
  });
});

const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port;

  console.log("App started at port:", port);
});
