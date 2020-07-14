const request = require('postman-request')

const baseUrl = 'http://dummy.restapiexample.com/api/v1/employees'

const connection = require('./mysql-connection.js')

request.get({url:baseUrl, json:true}, function(error, response, body){
    // console.log(body.data.employee_name)

    let dataArray = body.data
    for(let i = 0; i < dataArray.length; i++){
        
        let data = dataArray[i]
        
        let id = data.id
        let name = data.employee_name
        let age = data.employee_age
        let salary = data.employee_salary

        

        for(let q = 0; q < id.length; q++){
            let query = 'insert into employee values (?,?,?,?)'
            let values = [id , name , age, salary]
    
            connection.query(query, values,
                function(error, results, fields){
                    console.log(results)
                })
        }
    }

})
connection.end()