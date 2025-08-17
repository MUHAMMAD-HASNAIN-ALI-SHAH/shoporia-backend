const express = require("express");
const { getMyOrders, getAllOrders, placedOrder } = require("../controllers/order.controller");
const router = express.Router();

router.route("/get-my-orders").get(getMyOrders)
router.route("/get-all-orders").get(getAllOrders);
router.route("/place-order").get(placedOrder);

module.exports = router;
