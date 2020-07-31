const express = require("express");
const dotenv = require("dotenv");
// 파일 처리를 위한 라이브러리 임포트
const fileupload = require("express-fileupload");
const path = require("path");

const movies = require("./routes/movies");
const users = require("./routes/users");
const favorites = require("./routes/favorites");
const reply = require("./routes/reply");
const reservation = require("./routes/reservation");

// 환경설정 파일 로딩
dotenv.config({ path: "./config/config.env" });

const app = express();
// post 사용시, body 부분을 json 으로 사용하겠따.
app.use(express.json());
app.use(fileupload());
// 이미지를 불러올 수 있도록 static 경로 설정
// join => 문자열 합치는 함수,  __dirname => (돌아가고있는 디렉토리 네임, 이새끼가 내장하고 있는 이름)뒤에 '' 안에는 경로
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/movies", movies);
app.use("/api/v1/users", users);
app.use("/api/v1/favorites", favorites);
app.use("/api/v1/reply", reply);
app.use("/api/v1/reservation", reservation);

const PORT = process.env.PORT || 5400;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV}mode on port ${PORT}`)
);
