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

require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
require("./authenticate");

const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(upload.array()); 

app.use(cookieParser(process.env.COOKIE_SECRET));

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },

//   credentials: true,
// };


var corsOptions = {
    origin: true,
    credentials: true };

app.use(cors(corsOptions));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

//   next();
// });

app.use(helmet());

// app.use(cors(corsOptions));

app.use(passport.initialize());

app.use("/auth", authRoutes);

app.get("/", function (req, res) {
  res.send({ status: "success" });
});

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

// mongoose
//   .connect(mongoDbUrl)
//   .then(() => {
//     app.listen(process.env.PORT || 5000);
//   })
//   .catch((err) => console.log(err));
