const express = require("express");
const {
  getMemos,
  getMemo,
  createMemo,
  updateMemo,
  deleteMemo,
} = require("./memos");

const router = express.Router();

// 각 경로별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").get(getMemos).post(createMemo);
router.route("/:id").get(getMemo).put(updateMemo).delete(deleteMemo);

module.exports = router;
