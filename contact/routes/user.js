const express = require("express");
const auth = require("../middleware/auth");
const {
  createUser,
  login,
  logout,
  addContact,
  getUserContact,
  updateUserContact,
  deleteUserContact,
  shareContact,
} = require("../controllers/user");

const router = express.Router();

// api/v1/users
router
  .route("/")
  .post(createUser)
  .get(auth, getUserContact)
  .put(auth, updateUserContact)
  .delete(auth, deleteUserContact);
router.route("/login").post(login);
router.route("/logout").delete(auth, logout);
router.route("/add").post(auth, addContact);
router.route("/share").put(auth, shareContact);

module.exports = router;
