// routes/payment.route.js
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const { createCheckOutSession } = require("../controllers/payment.controller");

// Normal route
router.post("/create-checkout-session", createCheckOutSession);

module.exports = router;
