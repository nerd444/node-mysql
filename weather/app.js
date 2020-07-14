const request = require('postman-request');

const baseUrl = 'http://api.weatherstack.com/'

let queryUrl = baseUrl + 'current?access_key=64f809309946a8b8c137cdd658a6229b' + '&query='
let query = 'seoul'

request.get({url:queryUrl + query, json:true}, function(error, response, body){
    console.log(response.statusCode)
    // console.log(body)
    // 온도만 출력
    console.log(body.current.temperature)
})



// request('http://api.weatherstack.com/current?access_key=64f809309946a8b8c137cdd658a6229b&query=seoul', function (error, response, body) {
//   console.log('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });

