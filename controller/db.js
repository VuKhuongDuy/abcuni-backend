var {mysql} = require('../config/config');
var bcrypt = require("bcryptjs");

// function execute(sql, params = []){
//     return new Promise((resolve, reject)=>{
//         mysql.getConnection(async function(err, connect){
//             try{
//                 if(err) reject(err);
//                 let result = await queryDB(connect, sql, params);
//                 resolve(result);
//             }catch(err){
//                 reject(err);
//             }
//         })
//     })
// }

// function queryDB(connect, sql, params){
//     return new Promise((resolve, reject)=>{
//         connect.query( sql, params, (err, result)=>{
//             if(err){
//                 reject(err);
//             }
//             else resolve(result);
//         })
//     })
// }

function execute(sql, params = []){
        return new Promise((resolve, reject)=>{
            mysql.query( sql, params, (err, result)=>{
                if(err){
                    reject(err);
                }
                else resolve(result);
            })
        })
    }

function comparePassword(password1, password2){
    return bcrypt.compareSync(password1, password2);
}


module.exports.execute = execute;
module.exports.comparePassword = comparePassword;