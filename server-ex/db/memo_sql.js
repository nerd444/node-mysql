// const connection = require("./mysql-connection");
const express = require("express");
const { getMemo, createMemo, updateMemo, deleteMemo } = require("./memo");

const router = express.Router();

// 각 경로별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").get(getMemo);
router.route("/:title/:memo").post(createMemo);
router.route("/:id/:title/:content").put(updateTitle);
router.route("/:id").delete(deleteMemo);

module.exports = router;
