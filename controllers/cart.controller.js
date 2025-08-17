const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

// Add product to cart (creates order under pending cart)
const addToCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { productId, quantity } = req.body;
    if (!productId || !quantity)
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Find or create pending cart
    let cart = await Cart.findOne({
      email: user.email,
      paymentStatus: "pending",
    });
    if (!cart) {
      cart = new Cart({ email: user.email });
      await cart.save();
    }

    // Check if an order for this product already exists in this cart
    let order = await Order.findOne({
      cartId: cart._id,
      product: productId,
      status: "pending",
    });

    if (order) {
      order.quantity += quantity;
      await order.save();
    } else {
      order = new Order({ cartId: cart._id, product: productId, quantity });
      await order.save();
    }

    const orders = await Order.find({ cartId: cart._id }).populate("product");

    res.status(200).json({ message: "Product added to cart", cart, orders });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get logged-in user's cart with orders
const getMyCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({
      email: user.email,
      paymentStatus: "pending",
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const orders = await Order.find({ cartId: cart._id }).populate("product");

    res.status(200).json({ cart, orders });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update order quantity
const updateQuantity = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { orderId, quantity } = req.body;
    if (!orderId || quantity == null)
      return res
        .status(400)
        .json({ message: "Order ID and quantity are required" });

    const order = await Order.findById(orderId).populate("product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (quantity <= 0) {
      await Order.findByIdAndDelete(orderId);
    } else {
      order.quantity = quantity;
      await order.save();
    }

    const orders = await Order.find({ cartId: order.cartId }).populate(
      "product"
    );

    res.status(200).json({ message: "Cart updated", orders });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove order
const removeFromCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { orderId } = req.params;
    if (!orderId)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await Order.findByIdAndDelete(orderId);

    const orders = await Order.find({ cartId: order.cartId }).populate(
      "product"
    );

    res.status(200).json({ message: "Product removed from cart", orders });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Clear cart (delete all orders in pending cart)
const clearCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({
      email: user.email,
      paymentStatus: "pending",
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await Order.deleteMany({ cartId: cart._id });

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  getMyCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
