const connection = require("./mysql-connection.js");
// @desc 모든 정보를 다 조회
// @route GET /api/v1/bootcamps
// @access Public
exports.getMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    title: connection.query("select title from memo_api", function (
      error,
      results,
      fields
    ) {
      console.log(results);
    }),
    memo: connection.query("select memo from memo_api", function (
      error,
      results,
      fields
    ) {
      console.log(results);
    }),
  });
};

//   // @desc 해당 아이디의 정보 조회
//   // @route GET /api/v1/bootcamps/id
//   // @access Public
//   exports.getBootcamp = (req, res, next) => {
//     res.status(200).json({
//       success: true,
//       msg: `Show bootcamp ${req.params.id}번`,
//     });
//   };

// @desc 새로운 정보를 인서트
// @route POST /api/v1/title/memo
// @access Public
exports.createMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    title: connection.query(
      `insert into memo_api (title) values ("${req.params.title}")`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
    memo: connection.query(
      `insert into memo_api (memo) values ("${req.params.memo}")`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
  });
};

// @desc 기존 정보를 업데이트
// @route PUT /api/v1/bootcamps/id
// @access Public
exports.updateTitle = (req, res, next) => {
  res.status(200).json({
    success: true,
    reTitle: connection.query(
      `update memo_api set title = "${req.params.reTitle}" where title = "${req.params.reTitle}"`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
    title: connection.query(
      `update memo_api set title = "${req.params.title}" where title = "${req.params.title}"`,
      function (error, results, fields) {
        console.log(results);
      }
    ),
  });
};

// exports.updateMemo = (req, res, next) => {
//     res.status(200).json({
//       success: true,
//       memo: connection.query(
//           `update memo_api set title = "${req.params.memo}" where id = `,
//           function (error, results, fields) {
//             console.log(results);
//           }
//         ),
//     });
//   };

// @desc 해당 정보를 삭제
// @route DELETE /api/v1/bootcamps/id
// @access Public
exports.deleteMemo = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete bootcamp ${req.params.id}`,
  });
};
