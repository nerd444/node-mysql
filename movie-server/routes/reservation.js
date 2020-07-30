const express = require("express");
const auth = require("../middleware/auth");
const { reservation, getSeat, cancel } = require("../controllers/reservation");

const router = express.Router();

// api/v1/reply
router.route("/").post(auth, reservation).get(getSeat).delete(auth, cancel);

module.exports = router;
