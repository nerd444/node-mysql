// @desc 모든 정보를 다 조회
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: "Show all bootcamps", middleware: req.hello });
};

// @desc 해당 아이디의 정보 조회
// @route GET /api/v1/bootcamps/id
// @access Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Show bootcamp ${req.params.id}번`,
  });
};

// @desc 새로운 정보를 인서트
// @route POST /api/v1/bootcamps
// @access Public
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: "Create new bootcamp",
  });
};

// @desc 기존 정보를 업데이트
// @route PUT /api/v1/bootcamps/id
// @access Public
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Update bootcamp ${req.params.id}`,
  });
};

// @desc 해당 정보를 삭제
// @route DELETE /api/v1/bootcamps/id
// @access Public
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete bootcamp ${req.params.id}`,
  });
};
