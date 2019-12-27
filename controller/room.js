const {message} = require('../config/message')
const {insertArrayToSql} = require('../config/common');
let db = require('./db.js')

module.exports.getAllRoom = async (req, res) => {
    try{
        if(!req.params.exam_id){
            res.send({
                success: false,
                message: message.DATA_EMPTY
            });
            return;
        }
        let sql = "SELECT * FROM room where exam_id = ?" ;
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

module.exports.addRoom = async (req, res) => {
    try{
        if(!req.body.exam_id || !req.body.listRoom){
            res.send({success: false, message: message.DATA_EMPTY })
            return;
        }
        let listRoom = JSON.parse(req.body.listRoom);

        if(listRoom.length > 0 && (!listRoom[0].room_name || !listRoom[0].count_computer)){
            console.log(listRoom);

            res.send({success: false, message: message.DATA_ROOM_WRONG})
            return;
        }
        for(let i =0; i< listRoom.length; i++){
            if(!Number.isInteger(listRoom[i].count_computer)){
                res.send({success: false, message: message.DATATYPE_NOT_NUMBER})
                return;
            }
            listRoom[i]['exam_id'] = req.body.exam_id;
        }        
        let str = "INSERT INTO room(room_name, count_computer, exam_id) VALUES ";
        let {sql, params} = insertArrayToSql(str, listRoom);
        
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
    }catch(e){
        if(e.code === "ER_WRONG_VALUE_COUNT_ON_ROW") e.message = message.DATA_INPUT_INVALID;
        if( e.code ===  "ER_DUP_ENTRY") e.message = message.DUPLICATED_DATA;
        res.send({
            message: e.message,
            success: false
        });
    }
}

module.exports.deleteRoom = async(req, res) => {
    try{
        if(!req.params.room_id || !req.params.exam_id){
            res.send({
                success: false,
                message: message.DATA_EMPTY
            })
            return;
        }
        let sql = "DELETE FROM room WHERE room_id = ? AND exam_id = ?";
        let params = [req.params.room_id, req.params.exam_id];
        await db.execute(sql, params);

        let sql_turn = "DELETE FROM registed WHERE room_id = ? AND exam_id = ?";
        await db.execute(sql_turn, params);

        res.send({
            message: message.DELETESUCCESS,
            success: true
        })

    }catch(e){
        res.send({
            message: e.SERVER_ERROR,
            success: false
        });
    }
}
