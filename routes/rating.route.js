const express = require("express");
const { addRating, getProductRatings } = require("../controllers/rating.controller");
const router = express.Router();
require("dotenv").config();

router.route("/").post(addRating);
router.route("/:productId").get(getProductRatings);

module.exports = router;
