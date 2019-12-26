const { message } = require('../config/message')
const {insertArrayToSql} = require('../config/common');
let db = require('./db.js')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs")

module.exports.getUser = async (req, res) => {    
    try{
        let sql = '';
        let params = [req.user.username];
        let sql_user = "Select name_student as username, mssv, birthday from student where mssv = ? limit 1";
        let sql_admin = "Select email as username from admin where email = ? limit 1";
        sql = req.user.isAdmin ? sql_admin : sql_user;
        
        let data = await db.execute(sql, params);
        res.send({
            success: true,
            data: data[0]
        });
    }catch(e){
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }

}

// module.exports.createSuperAdmin = async (req, res) => {
//     let sql = "INSERT INTO admin(email, password, super_admin) VALUES (?, ?, 1)";
//     var salt = bcrypt.genSaltSync(10);
//     var passwordHash = bcrypt.hashSync("admin", salt); 

//     let params = ["admnin@abcunit.com", passwordHash];

//     await db.execute(sql, params);
// }

module.exports.login = async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            res.send({
                success: false,
                message: message.DATA_EMPTY
            })
            return;
        }
        let params = [req.body.username];
        let sql_user = "SELECT * FROM user WHERE mssv = ? LIMIT 1";
        let sql_admin = "SELECT * FROM admin WHERE email = ? LIMIT 1";
        
        let user = await db.execute(sql_user, params);
        let admin = await db.execute(sql_admin, params);
        if (
            (user.length === 0 || !db.comparePassword(req.body.password, user[0].password)) &&
            (admin.length === 0 || !db.comparePassword(req.body.password, admin[0].password)) 
        ) {
            res.send({
                success: false,
                message: message.WRONG_LOGIN
            })
            return;
        }
        let isAdmin = admin.length > 0 ? true : false;
        
        var jwtToken = jwt.sign(
            { username: req.body.username, isAdmin: isAdmin },
            "RESTFULAPIs"
        );

        res.send({
            success: true,
            token: jwtToken,
            isAdmin
        })
    } catch (err) {
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}

module.exports.getListAdmin = async(req, res) => {
    try{
        if(!isSuperAdmin(req.user.username)){
            res.send({success: false, message: message.PERMISSION});
            return;
        }
        let url = 'select email from admin where super_admin = 0';
        let data = await db.execute(url);
        res.send({
            success: true,
            data
        })
    }catch (err) {
        res.send({
            message: err.message,
            success: false
        });
    }
}

module.exports.addAdmin = async (req, res) => {
    try {
        if (!req.body.password || !req.body.email) {
            res.send({
                success: false,
                message: message.DATA_EMPTY
            })
            return;
        }

        if (await existUser(req.body.email, true)) {
            throw new Error(message.USER_EXIST);
        }

        if (!isSuperAdmin(req.user.username, req.user.password)) {
            throw new Error(message.NOT_SUPER_ADMIN);
        }

        if(!checkEmail(req.user.username)){
            res.send({success: false, message: message.EMAIL_INVALID})
            return;
        }

        var salt = bcrypt.genSaltSync(10);
        var passwordHash = bcrypt.hashSync(req.body.password, salt); 

        let sql = "INSERT INTO admin(email, password, super_admin) VALUES (?, ?, 0)";
        let params = [req.body.email, passwordHash];

        await db.execute(sql, params);
        res.send({
            success: true
        })

    } catch (err) {
        res.send({
            message: err.message,
            success: false
        });
    }
}

module.exports.addUser = async (req, res) => {
    try {
        if (!req.body || !req.body.length ||!req.body.length === 0 ) {
            res.send({
                success: false,
                message: message.DATA_EMPTY
            })
            return;
        }        
        let listUser = JSON.parse(req.body);
        if(listUser.length > 0 && (!listUser[0].password || !listUser[0].email || !listUser[0].mssv)){
            res.send({
                success: false,
                message: message.DATA_USER_WRONG
            })
            return;
        }
        
        var salt = await bcrypt.genSaltSync(10);
        for(let i=0; i< listUser.length; i++){
            console.log(listUser[i].email);
            if(!checkEmail(listUser[i].email)){
                res.send({
                    success: false,
                    message: message.EMAIL_INVALID
                })
                return;
            }
            listUser[i].password += "";   
            var passwordHash = bcrypt.hashSync(listUser[i].password, salt); 
            listUser[i].password = passwordHash;
        }
        let str = "INSERT INTO user(mssv, email, password) VALUES ";
        let {sql, params} = insertArrayToSql(str, listUser);        
        await db.execute(sql, params);

        res.send({
            message: message.ADDSUCCESS,
            success: true
        })

    } catch (e) {
        if(e.code === "ER_WRONG_VALUE_COUNT_ON_ROW") e.message = message.DATA_INPUT_INVALID;
        if( e.code ===  "ER_DUP_ENTRY") e.message = message.DUPLICATED_DATA;
        res.send({
            message: e.message,
            success: false
        });
    }
}


module.exports.changePasswordUser = async (req, res) => {
    try {
        if (
            !req.body.oldPassword || 
            !req.body.newPassword || 
            !req.body.username || 
            !req.body.confirmPassword || 
            req.body.oldPassword === '' ||
            req.body.newPassword === '' || 
            req.body.username === '' || 
            req.body.confirmPassword === ''
        ) {
            res.status(200).send({
                message: message.DATA_EMPTY,
                success: false
            });
            return;
        }

        if(req.body.newPassword != req.body.confirmPassword){
            res.status(200).send({
                message: message.PASSWORD_CONFIRM_WRONG,
                success: false
            });
            return;
        }
        let sql_user = "SELECT * FROM user WHERE mssv = ? LIMIT 1";
        let params = [req.body.username];
        let user = await db.execute(sql_user, params);

        if (user.length === 0 || !db.comparePassword(req.body.oldPassword, user[0].password)) {
            res.send({
                success: false,
                message: message.PASSWORD_WRONG
            })
            return;
        }

        let sql = " UPDATE user SET password = ? WHERE mssv = ?";
        var salt = bcrypt.genSaltSync(10);
        var passwordHash = bcrypt.hashSync(req.body.newPassword, salt); 
        params = [passwordHash, req.body.username];
        await db.execute(sql, params);

        res.send({
            message: message.CHANGE,
            success: true
        })

    } catch (err) {
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}

module.exports.checkAdmin = function(req, res){
    res.send({
        success: true
    })
}

async function existUser(username) {
    let sql1 = "SELECT * FROM admin WHERE email = ? LIMIT 1";
    let sql2 = "SELECT * FROM user WHERE mssv = ? LIMIT 1";

    let params = [username];
    let result1 = await db.execute(sql1, params);
    let result2 = await db.execute(sql2, params);
    return result1.length > 0 || result2.length > 0;
}

async function isSuperAdmin(email) {
    let sql = "SELECT * FROM admin WHERE email = ? AND super_admin = 1";
    let params = [email];
    let result = await db.execute(sql, params);
    return result.length > 0;
}

function checkEmail(email){
    let regex = /^[a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/gm;
    let isEmail = regex.test(email);
    console.log(isEmail);
    return isEmail;
}
