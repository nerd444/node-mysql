const mysql = require('mysql')

const connection = mysql.createConnection(
    {
        host : 'database-2.c3igvgofvrsa.ap-northeast-2.rds.amazonaws.com',
        user : 'node_user',
        database : 'my_test',
        password : 'tkdwlsnlmoonlm'
    }
)

module.exports = connection

