const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo").default;

const connectDB = require("../app/db/config");
const requestLogger = require("./middleware/requestLogger");
const errorLogger = require("./middleware/errorLogger");

// connect to MongoDB
connectDB();

const app = express();

const routeHandler = require("./routes");
const logRoutes = require("./routes/logRoutes");

app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
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
  }),
);

// app.use((req, res, next) => {
//   if (req.session.userId) {
//     console.log("=== GET CURRENT USER ===");
//     console.log("Session ID:", req.sessionID);
//     console.log("User ID:", req.session.userId);
//   }
//   next();
// });

// Add request logging middleware
app.use(requestLogger);

// localhost:3000/api/v1
app.use("/api/v1", routeHandler);
app.use("/logs", logRoutes);

// last to collect all the next()
app.use(errorLogger);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

module.exports = app;
