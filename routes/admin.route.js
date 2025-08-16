const express = require("express");
const router = express.Router();
require("dotenv").config();
const adminMiddleware = require("../middlewares/admin.middleware");
const {
  addProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.route("/product").post(adminMiddleware, addProduct);
router.route("/product/:productId").put(adminMiddleware, editProduct);
router.route("/product/:productId").delete(adminMiddleware, deleteProduct);

module.exports = router;
