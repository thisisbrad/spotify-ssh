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
    tokenExpiry: Date,
    refresh_token: String,
  },
  { timestamps: true },
);

userSchema.methods.isTokenExpired = function () {
  if (!this.tokenExpiry) return true;
  return new Date() >= this.tokenExpiry;
};

module.exports = mongoose.model("User", userSchema);
