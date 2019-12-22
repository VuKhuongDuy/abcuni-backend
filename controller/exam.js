const {message} = require('../config/message')
let db = require('./db.js')


module.exports.getAllExam = async (req, res) => {
    try{
        let sql = "SELECT * FROM exam";
        let data = await db.execute(sql);
        
        res.send({
            success: true,
            data
        })
    }catch(e){
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}

module.exports.addExam = async (req, res) => {
    try{
        if(!req.body.nameExam){
            res.send({
                message: message.DATA_EMPTY,
                success: false
            })
            return;
        }

        let sqlExistExam = "Select * from exam where exam_name = ? limit 1";
        let params = [req.body.nameExam];
        let data = await db.execute(sqlExistExam, params);
        if(data.length > 0){
            res.send({success: false, message: message.EXAM_EXISTED});
            return;
        }

        let sql = "INSERT INTO exam(exam_name) VALUES(?)";
        params = [req.body.nameExam];
        await db.execute(sql, params);

        res.send({
            message: message.ADDSUCCESS,
            success: true
        })

    }catch(e){
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}

module.exports.deleteExam = async(req, res) => {
    try{
        if(!req.params.exam_name){
            res.send({
                success: false, message: message.DATA_EMPTY
            })
        }
        let sql = "DELETE FROM exam WHERE exam_name = ?";
        let params = [req.params.exam_name];

        await db.execute(sql, params);
        res.send({
            message: message.ADDSUCCESS,
            success: true
        })

    }catch(e){
        res.send({
            message: e.message,
            success: false
        });
    }
}