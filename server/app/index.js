const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("../app/db/config");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo").default;

// connect to MongoDB
connectDB();

const app = express();

const routeHandler = require("./routes");

app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
// JSON data
app.use(express.json());
// Form data
app.use(express.urlencoded({ extended: true }));

// Session setup with cookie
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use((req, res, next) => {
  if (req.session.userId) {
    console.log("Session ID:", req.sessionID);
    console.log("User ID:", req.session.userId);
  }
  next();
});

// localhost:3000/api/v1
app.use("/api/v1", routeHandler);

module.exports = app;
