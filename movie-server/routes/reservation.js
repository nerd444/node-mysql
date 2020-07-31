const express = require("express");
const auth = require("../middleware/auth");
const {
  reservation,
  getSeat,
  cancel,
  getMySeat,
} = require("../controllers/reservation");

const router = express.Router();

// api/v1/reply
router.route("/").post(auth, reservation).get(getSeat);
router.route("/myseat").get(auth, getMySeat);
router.route("/:reservation_id").delete(auth, cancel);

module.exports = router;
