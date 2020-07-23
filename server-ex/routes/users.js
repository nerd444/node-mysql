const express = require("express");
const auth = require("../middleware/auth");

const {
  createUser,
  loginUser,
  updatePasswd,
  getMyInfo,
} = require("../controllers/users");

const router = express.Router();

router.route("/").post(createUser).get(auth, getMyInfo);
router.route("/login").post(loginUser);
router.route("/change").post(updatePasswd);

module.exports = router;
