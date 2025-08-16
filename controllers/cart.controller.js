const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// Add or increase quantity
const addToCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ email: user.email });

    if (!cart) {
      cart = new Cart({ email: user.email, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    console.log("Saving cart:", cart);
    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get logged-in user's cart
const getMyCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ email: user.email }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update quantity
const updateQuantity = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { productId, quantity } = req.body;
    if (!productId || quantity == null) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const cart = await Cart.findOne({ email: user.email });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cart.items[itemIndex].quantity = quantity;

    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove product
const removeFromCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const cart = await Cart.findOne({ email: user.email });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ email: user.email });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
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
