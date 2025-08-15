const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dpb0qryd0/image/upload/v1752848151/download_w9qcwl.png",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
