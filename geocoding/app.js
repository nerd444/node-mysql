// const request = require('postman-request');

// // 1. 화곡역의 위도, 경도를 뽑아서 출력.
// const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/화곡역.json?access_token=pk.eyJ1IjoibHVjeTA0MjAiLCJhIjoiY2tjbXh4OG10MDV3azJzbXRpbWl4aGliOCJ9.1txgiWx3vvAHQA5ysdCxtw'
// let encodedUrl = encodeURI(url)

// // 위도, 경도
// request.get({url:encodedUrl, json:true}, function(error, response, body){
//     console.log(body.features[0].center[1])
//     console.log(body.features[0].center[0])
// })

// // request('http://www.google.com', function (error, response, body) {
// //   console.log('error:', error); // Print the error if one occurred
// //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
// //   console.log('body:', body); // Print the HTML for the Google homepage.
// // });


// 2. 유튜브의 내가 좋아하는 정보로 검색해서, 디비에 저장하기.
const request = require('postman-request');
const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyCpipXVTC4xf5-mxzRHDvGsPSRGISp632w&maxResults=10&order=date&type=video&regionCode=KR&q=잠'
let encodedUrl = encodeURI(url)

const connection = require('./mysql-connection.js')

request.get({url:encodedUrl, json:true}, function(error, response, body){
        let itemsArray = body.items

        for(let i = 0; i < itemsArray.length; i++){
            
            let items = itemsArray[i]

            let video_id = items.id.videoId
            let title = items.snippet.title
            let channel_title = items.snippet.channelTitle
            let thumbnail_url = items.snippet.thumbnails.high.url
    
            let query = `insert into youtube (video_id, title, channel_title, thumbnail_url) values ("${video_id}", "${title}", "${channel_title}", "${thumbnail_url}")`
    
            connection.query(query,
                function(error, results, fields){
                    console.log(results)
                })
        }
    
        connection.end()
})