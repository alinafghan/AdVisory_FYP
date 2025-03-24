const express = require("express");
const {
  getPrice,
  add,
  getAdsfromCampaign,
  postCampaign,
  getAllCampaigns,
} = require("../controllers/ad_controller");

const router = express.Router();

router.post("/getBudget", getPrice);
router.post("/add", add);
router.post("/getAdsfromCampaign", getAdsfromCampaign);
router.get("/getAllCampaigns", getAllCampaigns);
router.post("/postCampaign", postCampaign);

module.exports = router;
