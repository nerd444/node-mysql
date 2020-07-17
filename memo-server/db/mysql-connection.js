const mysql = require("mysql");
const db_config = require("../config/db-config.json");

const connection = mysql.createConnection({
  host: db_config.MYSQL_HOST,
  user: db_config.MYSQL_USER,
  database: db_config.DB_NAME,
  password: db_config.DB_PASSWORD,
});

module.exports = connection;
