const express = require("express");
const app = express();

app.get("/", function (req, res) {
  res.send("Let's go home");
});

app.listen(3000);
