const express = require("express");
const auth = require("../middleware/auth");

const {
  getMemos,
  createMemos,
  updateMemos,
  deleteMemos,
} = require("../controllers/memos");
const { createUser, loginUser } = require("../controllers/users");

const router = express.Router();

router.route("/").get(getMemos).post(createMemos);
router.route("/:id").put(updateMemos).delete(deleteMemos);
router.route("/signUp").post(createUser);
router.route("/users/login").post(loginUser);

module.exports = router;
