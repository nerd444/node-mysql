const express = require("express");

const {
  getMemos,
  createMemos,
  updateMemos,
  deleteMemos,
} = require("../controllers/memos");

const router = express.Router();

router.route("/").get(getMemos).post(createMemos);
router.route("/:id").put(updateMemos).delete(deleteMemos);

module.exports = router;
