const connection = require('./mysql-connection.js')

// 1.
connection.query('select s.title, r.rating from series as s join reviews as r on s.id = r.series_id order by s.title',
    function(error, results, fields){
        console.log(results)
    })

// 2.
connection.query('select s.title, avg(r.rating) as avg_rating from series as s join reviews as r on s.id = r.series_id group by s.title order by avg_rating',
    function(error, results, fields){
        console.log(results)
    })

// 3.
connection.query('select rs.first_name, rs.last_name, r.rating from reviews as r join reviewers as rs on r.reviewer_id = rs.id',
    function(error, results, fields){
        console.log(results)
    })

// 4.
connection.query('select s.title as unreviewed_series from series as s left join reviews as r on s.id = r.series_id where r.rating is null',
    function(error, results, fields){
        console.log(results)
    })

// 5.
connection.query('select s.genre, avg(r.rating) as avg_rating from series as s join reviews as r on s.id = r.series_id group by s.genre order by s.genre',
    function(error, results, fields){
        console.log(results)
    })

// 6.
connection.query('select rs.first_name, rs.last_name, ifnull(r.rating,0), ifnull(count(r.rating),0) as count,ifnull(min(r.rating),0) as min, ifnull(max(r.rating),0) as max, avg(ifnull(r.rating,0)) as avg, if(ifnull(count(r.rating),0) >= 5, "ACTIVE", "INACTIVE") as status from reviewers as rs left join reviews as r on rs.id = r.reviewer_id group by rs.id order by count desc',
    function(error, results, fields){
        console.log(results)
    })

// 7.
connection.query('select s.title, r.rating,concat(rw.first_name," ",rw.last_name) as reviewer from reviews as r join reviewers as rw on rw.id = r.reviewer_id join series as s on s.id = r.Series_id order by s.title asc',
    function(error, results, fields){
        console.log(results)
    })




connection.end()