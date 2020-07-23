const express = require("express");
const auth = require("../middleware/auth");

const {
  getMemos,
  createMemos,
  updateMemos,
  deleteMemos,
  signUp,
} = require("../controllers/memos");

const router = express.Router();

router.route("/").get(getMemos).post(createMemos);
router.route("/:id").put(updateMemos).delete(deleteMemos);
router.route("/signUp").post(signUp);

module.exports = router;
