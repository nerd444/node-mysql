// @desc 모든 정보를 다 조회
// @route GET /api/v1/bootcamps
// @access Public
exports.getMemos = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: "Show all memos", middleware: req.hello });
};

// @desc 해당 아이디의 정보 조회
// @route GET /api/v1/bootcamps/id
// @access Public
exports.getMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Show memo ${req.params.id}번`,
  });
};

// @desc 새로운 정보를 인서트
// @route POST /api/v1/bootcamps
// @access Public
exports.createMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: "Create new memo",
  });
};

// @desc 기존 정보를 업데이트
// @route PUT /api/v1/bootcamps/id
// @access Public
exports.updateMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Update memo ${req.params.id}`,
  });
};

// @desc 해당 정보를 삭제
// @route DELETE /api/v1/bootcamps/id
// @access Public
exports.deleteMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete memo ${req.params.id}`,
  });
};
