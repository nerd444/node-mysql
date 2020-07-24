const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const { createUser, loginUser, my_Info } = require("../controllers/users");
// /api/v1/users
router.route("/").post(createUser);
// /api/v1/users/login
router.route("/login").post(loginUser);
// /api/v1/users/me
router.route("/me").get(auth, my_Info);

module.exports = router;
