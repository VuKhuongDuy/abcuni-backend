const {message} = require('../config/message')
const {insertArrayToSql} = require('../config/common');
let db = require('./db.js')

module.exports.getAllSubject = async (req, res) => {
    try{
        if(!req.params.exam_id){
            res.send({
                message: message.DATA_EMPTY,
                success: false
            });
            return;
        }
        let sql = "SELECT * FROM subject where exam_id = ?";
        let params = [req.params.exam_id];
        let data = await db.execute(sql, params);

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

module.exports.getSubjectByStudent = async (req, res) => {
    try{
        if(!req.params.exam_id || (req.user.isAdmin && !req.params.mssv)){
            res.send({
                message: message.DATA_EMPTY,
                success: false
            });
            return;
        }

        let sql = "SELECT s.subject_code,s.subject_name,s.credit, ss.enable_test FROM subject_student as ss, subject as s WHERE ss.mssv = ? AND ss.subject_code = s.subject_code AND ss.exam_id = ?";
        let params  = [];

        if(req.user.isAdmin) params = [req.params.mssv, req.params.exam_id];
        else params = [req.user.username, req.params.exam_id];

        let data = await db.execute(sql, params);
        console.log(data);
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

module.exports.getStudentBySubject = async(req, res) => {
    try{
        if(!req.params.code_subject){
            res.send({
                message: message.DATA_EMPTY,
                success: false
            });
            return;
        }

        let sql = "Select st.mssv, st.name_student, su.subject_code, su.subject_name, su.credit, ss.enable_test FROM subject_student as ss, student as st, subject as su WHERE ss.subject_code = ? AND ss.mssv = st.mssv AND ss.subject_code = su.subject_code AND ss.exam_id = ?";
        let params = [req.params.code_subject, req.params.exam_id];
        let data = await db.execute(sql, params);
        console.log(data);
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

module.exports.addSubject = async (req, res) => {
    try{
        if(!req.body.listRoom|| !req.body.exam_id){
            res.send({
                success: false,
                message: message.DATA_EMPTY
            })
            return;
        }
        let listSubject = JSON.parse(req.body.listRoom);

        if(listSubject.length > 0 && (!listSubject[0].code_subject || !listSubject[0].name_subject || !listSubject[0].credit)){
            res.send({success: false, message: message.DATA_SUBJECT_WRONG})
            return;
        }

        for(let i =0; i< listSubject.length; i++){
            console.log(listSubject[i].credit);
            console.log(Number.isInteger(listSubject[i].credit));
            if(!Number.isInteger(listSubject[i].credit)){
                res.send({success: false, message: message.DATATYPE_NOT_NUMBER})
                return;
            }
            listSubject[i]['exam_id'] = req.body.exam_id;
        }
        let str = "INSERT INTO subject(subject_code, subject_name, credit, exam_id) VALUES ";     
        let {sql,params} = insertArrayToSql(str, listSubject);

        await db.execute(sql, params);
        res.send({
            message: message.ADDSUCCESS,
            success: true
        })

    }catch(e){
        if(e.code === "ER_WRONG_VALUE_COUNT_ON_ROW") e.message = message.DATA_INPUT_INVALID;
        if( e.code ===  "ER_DUP_ENTRY") e.message = message.DUPLICATED_DATA;
        res.send({
            // message: message.SERVER_ERROR,
            message: e.message,
            success: false
        });
    }
}

module.exports.addStudentSubject = async (req, res) => {
    try {
        if(!req.body.listStudent  || !req.body.exam_id || !req.body.subject_code){
            res.send({ success: false,message: message.DATA_EMPTY})
            return;
        }

        let listStudent = JSON.parse(req.body.listStudent);

        if(listStudent.length>0 && (!listStudent[0].mssv || !listStudent[0].enable_test)){
            res.send({success: false, message: message.DATA_STUDENT_SUBJECT_WRONG})
            return;
        }

        let str = "INSERT INTO subject_student(mssv, enable_test, exam_id, subject_code) VALUES ";
        for(let i=0;i < listStudent.length; i++){
            listStudent[i].exam_id = req.body.exam_id;
            listStudent[i].subject_code = req.body.subject_code;
        }
        let {sql, params} = insertArrayToSql(str, listStudent);
        if(params.length === 0){
            res.send({
                success: false,
                message: message.DATA_EMPTY
            })
            return;
        }
        await db.execute(sql, params);
        res.send({
            message: message.ADDSUCCESS,
            success: true
        })
    } catch (e) {
        if(e.code === "ER_WRONG_VALUE_COUNT_ON_ROW") e.message = message.DATA_INPUT_INVALID;
        if( e.code ===  "ER_DUP_ENTRY") e.message = message.DUPLICATED_DATA;
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}

module.exports.deleteSubject = async (req, res) => {
    try{
        if(!req.params.exam_id || !req.params.code_subject){
            res.send({success: false, message: message.DATA_EMPTY})
            return;
        }

        let sql = "DELETE FROM subject WHERE exam_id = ? AND subject_code = ?";
        let params = [req.params.exam_id, req.params.code_subject];
        await db.execute(sql, params);
        let sql_subject_student = "DELETE FROM subject_student WHERE exam_id = ? AND subject_code = ?";
        await db.execute(sql_subject_student, params);
        let sql_subject_turn = "DELETE FROM student_registed WHERE registed_id in (SELECT registed_id FROM registed WHERE exam_id = ? AND subject_code = ?)";
        await db.execute(sql_subject_turn, params);
        let sql_registed = 'DELETE FROM registed WHERE exam_id = ? AND subject_code = ?'
        await db.execute(sql_registed, params);
        res.send({
            message: message.DELETESUCCESS,
            success: true
        })
    }catch(e){
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}