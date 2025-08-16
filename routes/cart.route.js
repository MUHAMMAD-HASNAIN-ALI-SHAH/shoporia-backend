const express = require("express");
const router = express.Router();
const {
  addToCart,
  getMyCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

router.post("/add", addToCart);
router.get("/", getMyCart);
router.put("/update", updateQuantity);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
