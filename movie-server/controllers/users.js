const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const connection = require("../db/mysql-connection");

// @desc    회원가입
// @route   POST    /api/v1/users
// @parameters  email, passwd
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // npm validator
  if (!validator.isEmail(email)) {
    res.status(400).json();
    return;
  }

  // npm bcryptjs
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  let query = "insert into movie_user (email, passwd) values ( ? , ? )";
  let data = [email, hashedPasswd];
  let user_id;

  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query, data);
    user_id = result.insertId;
  } catch (e) {
    await conn.rollback();
    res.status(500).json();
    return;
  }

  // 토큰 처리  npm jsonwebtoken
  // 토큰 생성 sign
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into movie_token (token, user_id) values (? , ? )";
  data = [token, user_id];

  try {
    [result] = await conn.query(query, data);
  } catch (e) {
    await conn.rollback();
    res.status(500).json();
    return;
  }

  await conn.commit();
  await conn.release();

  res.status(200).json({ success: true, token: token });
};

// @desc        로그인
// @route       POST    /api/v1/users/login
// @parameters  email, passwd
exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = "select * from movie_user where email = ? ";
  let data = [email];

  let user_id;
  try {
    [rows] = await connection.query(query, data);
    let hashedPasswd = rows[0].passwd;
    user_id = rows[0].id;
    const isMatch = await bcrypt.compare(passwd, hashedPasswd);
    if (isMatch == false) {
      res.status(401).json();
      return;
    }
  } catch (e) {
    res.status(500).json();
    return;
  }
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into movie_token (token, user_id) values (?, ?)";
  data = [token, user_id];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    res.status(500).json();
  }
};

// @desc  로그아웃 (현재의 기기 1개에 대한 로그아웃)
// @route DELETE  /api/v1/users/logout
exports.logout = async (req, res, next) => {
  // movie_token 테이블에서, 토큰 삭제해야 로그아웃이 되는 것이다.
  let user_id = req.user.id;
  let token = req.user.token;

  let query = `delete from movie_token where token = "${token}" and user_id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    res
      .status(200)
      .json({ success: true, message: "이 기기에서 로그아웃되었습니다." });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc      유저의 프로필 사진 설정하는 API
// @route     PUT /api/v1/users/me/photo
// @request   photo
// @response  success

// 클라이언트가 사진을 보낸다. => 서버가 이 사진을 받는다. =>
// 서버가 이 사진을 디렉토리에 저장한다. => 이 사진의 파일명을 DB에 저장한다.
exports.userPhotoUpload = async (req, res, next) => {
  let user_id = req.user.id;
  // 사진을 받으면 req.files에 들어있음.
  if (!user_id || !req.files) {
    res.status(400).json({ message: "뭐 하나 없는거 같지 않니...?" });
    return;
  }
  console.log(req.files);

  const photo = req.files.photo;
  // 지금 받은 파일이, 이미지 파일인지 체크
  // startsWith() => ()안에 있는 걸로 시작하냐?
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ message: "이미지 파일이 아닙니다." });
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일크기가 정해진것보다 커!" });
    return;
  }

  // 파일명 = ${path.parse(photo.name).ext} => jpg (ext = 앞의 확장자명을 가져옴), path다운이유쓰
  // fall.jpg => photo_3.jpg
  // path 의 parse는 이름과 확장자명을 파싱하는데 우리는 이름은 버리고 확장자명만 가져옴.
  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;

  // 저장할 경로 셋팅 = ./public/upload/photo_3.jpg
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  // 파일을 우리가 지정한 경로에 저장.
  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.errno(err);
      return;
    }
  });

  // db에 이 파일이름을 업데이트 한다.
  let query = `update movie_user set photo_url = "${photo.name}" where id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, message: "사진 잘 받아옴" });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// {
//   photo: {
//     name: 'fall.jpg',
//     data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff db 00 84 00 08 08 08 08 09 08 09 0a 0a 09 0d 0e 0c 0e 0d 13 12 10 10 12 13 1d 15 16 15 ... 1619565 more bytes>,
//     size: 1619615,
//     encoding: '7bit',
//     tempFilePath: '',
//     truncated: false,
//     mimetype: 'image/jpeg',
//     md5: '30fb7544a4c8400608908ec25fe666f3',
//     mv: [Function: mv]
//   }
// }
