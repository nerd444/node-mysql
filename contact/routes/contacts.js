const express = require("express");
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  searchContact,
} = require("../controllers/contacts");

const router = express.Router();

// 각 경로별로 데이터 가져올 수 있도록, router 셋팅
router.route("").get(getContacts);
router.route("/").post(createContact);
router.route("/:id").get(getContact).put(updateContact).delete(deleteContact);
router.route("/search/search").get(searchContact);

module.exports = router;
