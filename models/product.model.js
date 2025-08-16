const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      enum: [
        "Electronics",
        "Men Clothing",
        "Women Clothing",
        "Home and Kitchen",
        "Books",
        "Toys",
        "Beauty and Personal Care",
        "Sports and Outdoors",
        "Shoes and Footwear",
        "Groceries",
        "Others",
      ],
      type: String,
      required: true,
    },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
