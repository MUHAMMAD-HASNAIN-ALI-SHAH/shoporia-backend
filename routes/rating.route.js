const express = require("express");
const { addRating } = require("../controllers/rating.controller");
const router = express.Router();
require("dotenv").config();

router.route("/").post(addRating);

module.exports = router;
