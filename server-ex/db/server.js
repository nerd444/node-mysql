// const connection = require("./mysql-connection.js");
const express = require("express");
const dotenv = require("dotenv");

// 우리가 만든 라우터 파일 가져온다.
const memo = require("./memo");

// 환경 설정 파일의 내용을 로딩한다.
dotenv.config({ path: "./config/config.env" });

// 웹서버 프레임워크인 익스프레스를 가져온다.
const app = express();

// 로그 찍는, 로거(함수) 만든다.
const logger = (req, res, next) => {
  req.hello = "Hello World";
  console.log("미들웨어 실행됨.");
  next();
};
// 미들웨어 연결
// 실행순서 중요, request가 실행될 때 실행됨.
app.use(logger);

// 라우터 연결 : url의 path와 라우터 파일과 연결
app.use("/api/v1/memo", memo);

// 환경설정 파일인, config.env 파일에 있는 내용을 불러오는 방법.
const PORT = process.eventNames.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
