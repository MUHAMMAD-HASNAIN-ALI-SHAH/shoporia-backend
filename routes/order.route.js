const express = require("express");
const {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");
const adminMiddleware = require("../middleware/admin.middleware");
const router = express.Router();

router.route("/get-my-orders").get(getMyOrders);
router.route("/get-all-orders").get(adminMiddleware, getAllOrders);
router.route("/update-order-status").post(adminMiddleware, updateOrderStatus);

module.exports = router;
