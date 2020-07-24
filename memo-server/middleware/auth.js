const jwt = require("jsonwebtoken");
const connection = require("../db/mysql-connection");

const auth = async (req, res, next) => {
  let token;
  try {
    token = req.header("Authorization").replace("Bearer ", "");
  } catch (e) {
    res.status(401).json({ error: "Please authenticate!" });
    return;
  }

  // 유저 아이디와 토큰으로, db에 저장되어있는 유효한 유저인지 체크.
  console.log(token);
  const decoded = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
  // jwt.sogn 할때 사용한 json 키 값을, 여기서 빼온다. => decoded.user_id
  let user_id = decoded.user_id;

  let query = `select mu.id,mu.email,mu.created_at
   from memo_token as mt 
   join memo_user as mu on mt.user_id = mu.id 
   where mt.user_id = ${user_id} and mt.token = "${token}"`;
  try {
    [rows] = await connection.query(query);
    if (rows.length == 0) {
      res.status(401).json({ error: "Please authenticate!" });
    } else {
      req.user = rows[0]; // req의 유저 정보다
      next();
    }
  } catch (e) {
    res.status(401).json({ error: "인증하세염" });
  }
};

module.exports = auth;
