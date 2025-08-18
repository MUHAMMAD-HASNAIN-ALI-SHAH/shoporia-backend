const express = require("express");
const { updateAddress, getMyAddress } = require("../controllers/address.controller");
const router = express.Router();

router.route("/").put(updateAddress);
router.route("/").get(getMyAddress);

module.exports = router;
