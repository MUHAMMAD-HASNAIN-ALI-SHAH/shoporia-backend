const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
