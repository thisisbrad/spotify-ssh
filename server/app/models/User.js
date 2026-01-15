const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    picture: String,
    access_token: String,
    expires_in: Number,
    refresh_token: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", authorSchema);
