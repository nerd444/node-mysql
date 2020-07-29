const express = require("express");
const auth = require("../middleware/auth");
const {
  replyUser,
  getReply,
  updateReply,
  deleteReply,
} = require("../controllers/reply");

const router = express.Router();

// api/v1/reply
router.route("/").post(auth, replyUser).get(getReply);
router.route("/update").put(auth, updateReply);
router.route("/delete").delete(auth, deleteReply);

module.exports = router;
