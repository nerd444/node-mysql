const express = require("express");
const dotenv = require("dotenv");

const movies = require("./routes/movies");
const users = require("./routes/users");
const favorites = require("./routes/favorites");
const reply = require("./routes/reply");

// 환경설정 파일 로딩
dotenv.config({ path: "./config/config.env" });

const app = express();
// post 사용시, body 부분을 json 으로 사용하겠따.
app.use(express.json());

app.use("/api/v1/movies", movies);
app.use("/api/v1/users", users);
app.use("/api/v1/favorites", favorites);
app.use("/api/v1/reply", reply);

const PORT = process.env.PORT || 5400;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV}mode on port ${PORT}`)
);
