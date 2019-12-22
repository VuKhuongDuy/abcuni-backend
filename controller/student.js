const { message } = require('../config/message')
const {insertArrayToSql} = require('../config/common');
let db = require('./db.js')

module.exports.getAllStudent = async (req, res) => {
    try{
        let sql = "SELECT * FROM student";
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

module.exports.addStudent = async (req, res) => {
    try {
        if(!req.body|| !req.body.length || req.body.length < 0){
            throw new Error(message.DATA_EMPTY)
        }
        let listStudent = JSON.parse(req.body);
        let str = "INSERT INTO student(mssv, name_student, birthday, sex) VALUES ";
        let {sql, params} = insertArrayToSql(str, listStudent);
        if(params.length === 0){
            throw new Error(message.DATA_EMPTY);
        }

        await db.execute(sql, params);
        res.send({
            message: message.ADDSUCCESS,
            success: true
        })

    } catch (e) {
        if( e.code ===  "ER_DUP_ENTRY") e.message = message.DUPLICATED_DATA;
        res.send({
            message: e.message,
            success: false
        });
    }
}

module.exports.deleteStudent = async (req, res) => {
    try {
        if (!req.params.mssv) {
            throw new Error(message.DATA_EMPTY);
        }

        let sql = "DELETE FROM student WHERE mssv = ?";
        let params = [req.params.mssv];
        await db.execute(sql, params);

        let sql_student_registed = "DELETE FROM student_registed WHERE mssv = ?";
        await db.execute(sql_student_registed, params);

        let sql_student_subject = "DELETE FROM subject_student WHERE mssv = ?";
        await db.execute(sql_student_subject, params);

        res.send({
            message: message.DELETESUCCESS,
            success: true
        })

    } catch (err) {
        res.send({
            message: err.message,
            success: false
        });
    }
}

module.exports.registSubject = async (req, res) => {
    try{
        if(!req.body.subject){
            res.send({success: false, message: message.DATA_EMPTY})
            return;
        }
        let subject = req.body.subject;

        let sqlCheckStudent = "select * from subject_student where subject_code = ? AND mssv = ? AND enable_test = 'Y' limit 1";
        let paramsCheckStudent = [subject["Mã môn"], req.user.username];
        let enable = await db.execute(sqlCheckStudent, paramsCheckStudent);
        if(enable.length === 0){
            res.send({
                success: false,
                message: message.DISABLE_TEST
            });
            return;
        }

        let sqlCheckSubjectDupplicate = "select subject_code from student_registed as sr, registed as re where mssv = ? AND sr.registed_id = re.registed_id AND re.subject_code = ?";
        let paramsCheckSubjectDupplicate = [req.user.username, subject["Mã môn"]];
        let isDupplicate = await db.execute(sqlCheckSubjectDupplicate, paramsCheckSubjectDupplicate);
        if(isDupplicate.length > 0){
            res.send({
                success: false,
                message: message.REGIST_DUPPLICATE
            });
            return;
        }
        let sqlRegist = "Insert into student_registed(mssv, registed_id) values(?, ?)";
        let paramsRegist = [req.user.username, subject["Id"]];
        await db.execute(sqlRegist, paramsRegist);

        let sqlUpdateCount = 'Update registed set count_registed = ? where registed_id = ?';
        let params = [(parseInt(subject["count_registed"]) + 1), subject["Id"]];
        await db.execute(sqlUpdateCount, params);
        res.send({
            success: true,
            message: message.ADDSUCCESS
        });

    }catch (err) {
        res.send({
            message: err.message,
            success: false
        });
    }
}

module.exports.deleteSubjectRegisted = async (req, res) => {
    try{
        if(!req.params.registed_id){
            res.send({
                success: true,
                message: message.DATA_EMPTY
            })
            return;
        }

        let sqlDelete = 'delete from student_registed where mssv = ? AND registed_id = ?';
        let paramsDelete = [req.user.username, req.params.registed_id];
        await db.execute(sqlDelete, paramsDelete);

        let sqlTakeCount = 'select count_registed from registed where registed_id = ? limit 1'
        let paramsCount = [req.params.registed_id];
        let count = await db.execute(sqlTakeCount, paramsCount);

        let sqlUpdate = 'update registed set count_registed = ? where registed_id = ?';
        let params = [(count[0].count_registed - 1) , parseInt(req.params.registed_id)];
        await db.execute(sqlUpdate, params);

        res.send({
            success: true,
            message: message.DELETESUCCESS
        })
    }catch(e){
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}