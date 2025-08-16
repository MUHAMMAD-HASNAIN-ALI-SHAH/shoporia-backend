const express = require("express");
const router = express.Router();
require("dotenv").config();
const { getAllProducts } = require("../controllers/product.controller");

router.route("/").get(getAllProducts);

module.exports = router;
