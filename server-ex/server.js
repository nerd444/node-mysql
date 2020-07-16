// express : 웹 서버를 동작시키는 프레임워크
const express = require("express");
const dotenv = require("dotenv");

// 환경 설정 파일의 내용을 로딩한다.
dotenv.config({ path: "./config/config.env" });

// 웹서버 프레임워크인 익스프레스를 가져온다.
const app = express();

// 환경설정 파일인, config.env 파일에 있는 내용을 불러오는 방법.
const PORT = process.eventNames.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
