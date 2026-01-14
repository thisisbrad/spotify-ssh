const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    googleId: String,
    picutre: String,
    access_token: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", authorSchema);
