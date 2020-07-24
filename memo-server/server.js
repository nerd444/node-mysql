const express = require("express");
const dotenv = require("dotenv");
const memos = require("./routes/memos");
const users = require("./routes/users");

// 환경설정파일 로딩
dotenv.config({ path: "./config/config.env" });

const app = express();
// post사용시, body부분을 json으로 사용하겠다.
app.use(express.json());

app.use("/api/v1/memos", memos);
app.use("/api/v1/users", users);

const PORT = process.env.PORT || 5100;

app.listen(PORT, console.log("App listening on port 5100!"));
