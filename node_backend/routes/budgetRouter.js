const express = require("express");
const { getPrice } = require("../controllers/budget_controller");
const router = express.Router();

router.post("/get", getPrice);

module.exports = router;
