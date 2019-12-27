const { message } = require('../config/message')
const {insertArrayToSql} = require('../config/common');
let db = require('./db.js')

module.exports.getSubjectRegisted = async (req, res) => {
    try{
        if(!req.params.exam_id){
            res.send({
                success: true,
                message: message.DATA_EMPTY
            })
            return;
        }

        let sql, params;
        if(!req.params.subject_code){
            params = [req.params.exam_id, req.params.exam_id];
            sql = "SELECT re.registed_id, re.subject_code, su.subject_name, su.credit, re.date, tu.time_begin, ro.room_name, re.count_registed, ro.count_computer FROM registed as re, subject as su, turn as tu, room as ro WHERE re.exam_id = ? AND su.exam_id = ? AND re.subject_code = su.subject_code AND re.turn_id = tu.turn_id AND re.room_id = ro.room_id";
        }else if(req.params.subject_code.length > 0 && req.params.subject_code != 'student'){
            params = [req.params.exam_id, req.params.exam_id, req.params.subject_code];
            sql = "SELECT re.registed_id, re.subject_code, su.subject_name, su.credit, re.date, tu.time_begin, ro.room_name, re.count_registed, ro.count_computer FROM registed as re, subject as su, turn as tu, room as ro WHERE re.exam_id = ? AND su.exam_id = ? AND re.subject_code = su.subject_code AND re.turn_id = tu.turn_id AND re.room_id = ro.room_id AND re.subject_code = ?";
        }else if(req.params.subject_code  === 'student'){
            params = [req.params.exam_id, req.params.exam_id, req.user.username];
            sql = "SELECT re.registed_id, re.subject_code, su.subject_name, su.credit, re.date, tu.time_begin, ro.room_name, re.count_registed, ro.count_computer FROM registed as re, subject as su, turn as tu, room as ro WHERE re.exam_id = ? AND su.exam_id = ? AND re.subject_code = su.subject_code AND re.turn_id = tu.turn_id AND re.room_id = ro.room_id AND re.registed_id in (select registed_id from student_registed where mssv = ?)";
        }
        
        let data = await db.execute(sql, params);
        for(let i = 0; i< data.length; i++){
            let date = new Date(data[i].date);
            let dateStr = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
            data[i]["date"] = dateStr;
        };
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

module.exports.getListStudentRegistedSubject = async(req, res) => {
    try{
        if(!req.params.registed_id){
            res.send({
                message: message.DATA_EMPTY,
                success: false
            });
            return;
        }

        let sql = 'select * from student as st, registed as re, student_registed as sr, turn as t, room as r, subject as su where st.mssv = sr.mssv AND re.registed_id = ? AND re.registed_id = sr.registed_id AND re.turn_id = t.turn_id AND r.room_id = re.room_id AND su.subject_code = re.subject_code';
        let params = [req.params.registed_id];
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

module.exports.registSubject = async(req, res) => {
    try{
        if(!req.body.exam_id || !req.body.subject_code || !req.body.turn_id || !req.body.room_id || !req.body.date){
            res.send({
                message: message.DATA_EMPTY,
                success: false
            });
            return;
        }
        let sql_existedSubject = 'select * from subject where subject_code = ? limit 1';
        let subject = await db.execute(sql_existedSubject, [req.body.subject_code]);
        if(subject.length === 0){
            res.send({
                success: false,
                message: message.SUBJECT_NONE_EXISTED
            })
        }
        let sql_existedTurn = 'select * from turn where turn_id = ?';
        let turn = await db.execute(sql_existedTurn, [req.body.turn_id]);
        if(turn.length === 0){
            res.send({
                success: false,
                message: message.TURN_NONE_EXISTED
            })
        }
        let sql_existedRoom = 'select * from room where room_id = ?';
        let room = await db.execute(sql_existedRoom, [req.body.room_id]);
        if(room.length === 0){
            res.send({
                success: false,
                message: message.ROOM_NONE_EXISTED
            })
        }

        let sql_duplicate = 'select * from registed where exam_id = ? AND turn_id = ? AND date = ? AND room_id = ? limit 1';
        let subjectDuplicate = await db.execute(sql_duplicate, [req.body.exam_id, req.body.turn_id, req.body.date, req.body.room_id]);
        if(subjectDuplicate.length > 0){
            res.send({success: false, message: message.DUPLICATED_SUBJECT_REGIST});
            return;
        }

        let sql = 'INSERT INTO registed(exam_id, subject_code, turn_id, date, room_id, count_registed) values(?, ?, ?, ?, ?, 0)';
        let params = [req.body.exam_id, req.body.subject_code, req.body.turn_id, req.body.date, req.body.room_id]
        let data = await db.execute(sql, params);
        res.send({
            success: true,
            message: message.ADDSUCCESS
        })
    }catch(e){
        res.send({
            message: message.SERVER_ERROR,
            success: false
        });
    }
}

module.exports.deleteSubjectRegisted = async(req, res) => {
    try{
        if(!req.params.registed_id){
            res.send({success: false, message: message.DATA_EMPTY})
            return;
        }
        let sql = 'delete from registed where registed_id = ?';
        let params = [req.params.registed_id];
        let data = await db.execute(sql, params);
        res.send({
            success: true,
            message: message.DELETESUCCESS
        });
    }catch(e){
        if( e.code ===  "ER_DUP_ENTRY") e.message = message.REGIST_DUPPLICATE;
        res.send({
            message: e.message,
            success: false
        });
    }
}
