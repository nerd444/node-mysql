console.log('utils.js called')

module.exports = {
    name : 'Mike',

    add : function(a,b){
    return a + b
    },

    minus : function(a, b){
    return a - b
    }
}

// const name = 'Mike'

// const add = function(a,b){
//     return a + b
// }

// const minus = function(a, b){
//     return a - b
// }

// // name을 노출 시켜줘야, 다른 파일에서 받을 수 있다.
// module.exports = {name, add, minus}