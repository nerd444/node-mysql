const express = require("express");
const auth = require("../middleware/auth");

const {
  signupUser,
  login_user,
  changePasswd,
  deleteUser,
  forgotPasswd,
  resetPasswd,
  likes,
  getLike,
  deleteLike,
} = require("../controllers/users");

const router = express.Router();

router.route("/").post(signupUser).delete(auth, deleteUser);
router.route("/login").post(login_user);
router.route("/change").post(changePasswd);
router.route("/forgotpasswd").post(auth, forgotPasswd);
router.route("/resetPasswd/:resetPasswdToken").post(auth, resetPasswd);
router.route("/like").post(auth, likes);
router.route("/like").get(auth, getLike);
router.route("/like").delete(auth, deleteLike);

module.exports = router;
