const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  getAllProducts,
  getProductById,
} = require("../controllers/product.controller");

router.route("/").get(getAllProducts);
router.route("/:productId").get(getProductById);

module.exports = router;
