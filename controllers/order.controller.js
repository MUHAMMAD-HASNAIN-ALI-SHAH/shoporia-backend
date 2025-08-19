const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

// Get orders for logged-in user
const getMyOrders = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.session.user;

    // 1️⃣ Find all completed carts for this user
    const carts = await Cart.find({
      email: user.email,
      paymentStatus: "completed",
    }).sort({ createdAt: -1 });

    if (!carts || carts.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // 2️⃣ Fetch all orders linked to these carts
    const orders = await Order.find({
      cartId: { $in: carts.map((c) => c._id) },
    })
      .populate("product") // will hydrate `product: Product`
      .sort({ createdAt: -1 });

    // 3️⃣ Group orders by cartId into proper shape
    const groupedOrders = carts.map((cart) => ({
      cartId: cart._id.toString(),
      email: cart.email,
      paymentStatus: cart.paymentStatus,
      createdAt: cart.createdAt,
      items: orders
        .filter((o) => o.cartId.toString() === cart._id.toString())
        .map((o) => ({
          _id: o._id.toString(),
          cartId: o.cartId.toString(),
          product: o.product,
          quantity: o.quantity,
          createdAt: o.createdAt,
          status: o.status,
          rated: o.rated,
        })),
    }));

    res.status(200).json(groupedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all completed orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const carts = await Cart.find({ paymentStatus: "completed" }).sort({
      createdAt: -1,
    });

    if (!carts || carts.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    const orders = await Order.find({
      cartId: { $in: carts.map((c) => c._id) },
    })
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res
        .status(400)
        .json({ message: "Order ID and status are required" });
    }

    const validStatuses = [
      "pending",
      "placed",
      "shipped",
      "canceled",
      "delivered",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
