const User = require("../models/auth.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Rating = require("../models/rating.model");

const addRating = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const getUser = await User.findOne({ email: user.email });
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { orderId, rating, feedback } = req.body;
    if (!orderId || !rating) {
      return res
        .status(400)
        .json({ message: "Order ID and rating are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.rated) {
      return res.status(400).json({ message: "rating already exists" });
    }

    order.rated = true;

    await order.save();

    const getProduct = await Product.findById(order.product);

    if (!getProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    getProduct.ratingsCount += 1;
    getProduct.ratingsAverage =
      (getProduct.ratingsAverage * (getProduct.ratingsCount - 1) + rating) /
      getProduct.ratingsCount;

    await getProduct.save();

    const ratingData = {
      user: getUser._id,
      product: getProduct._id,
      productId: getProduct._id,
      rating: rating,
      comment: feedback || "",
    };

    const newrating = new Rating(ratingData);
    await newrating.save();

    console.log("Rating added successfully");

    res.status(200).json({ message: "rating added successfully", order });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addRating,
};
