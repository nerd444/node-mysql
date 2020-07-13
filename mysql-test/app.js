const connection = require('./mysql-connection.js')

let query = 'select * from memo'
connection.query(query, function(error, results, fields){
    console.log(results)
})

// 1.
connection.query('select s.first_name, p.title, p.grade from students as s join papers as p on s.id = p.student_id order by p.grade desc',
    function(error, results, fields){
        console.log(results)
    })

// 2.
connection.query('select s.first_name, p.title, p.grade from students as s left join papers as p on s.id = p.student_id order by s.id asc',
function(error, results, fields){
    console.log(results)
})

// 3.
connection.query('select s.first_name, p.title, ifnull(p.grade, 0) from students as s left join papers as p on s.id = p.student_id order by s.id asc',
function(error, results, fields){
    console.log(results)
})

// 4.
connection.query('select s.first_name, avg(round(ifnull(p.grade, 0),4)) as average from students as s left join papers as p on s.id = p.student_id group by s.first_name order by average desc, first_name desc',
function(error, results, fields){
    console.log(results)
})

// 5.
connection.query('select s.first_name, avg(ifnull(p.grade, 0)) as average, if(p.grade >= 80, "PASSING", "FALLING") as passing_status from students as s left join papers as p on s.id = p.student_id group by s.first_name order by average desc, first_name desc',
function(error, results, fields){
    console.log(results)
})

connection.end()