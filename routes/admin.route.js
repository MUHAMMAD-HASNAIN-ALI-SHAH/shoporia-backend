const express = require("express");
const router = express.Router();
require("dotenv").config();
const adminMiddleware = require("../middlewares/admin.middleware");
const { addProduct } = require("../controllers/product.controller");

router.route("/product").post(adminMiddleware, addProduct);

module.exports = router;
