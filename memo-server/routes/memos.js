const express = require("express");
const router = express.Router();
const {
  getMemos,
  createMemos,
  updateMemos,
  deleteMemos,
} = require("../controllers/memos");

router.route("/").get(getMemos).post(createMemos);
router.route("/:id").put(updateMemos).delete(deleteMemos);

module.exports = router;
