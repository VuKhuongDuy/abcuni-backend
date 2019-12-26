const { message } = require('../config/message')
const {insertArrayToSql} = require('../config/common');
let db = require('./db.js')

module.exports.addTurn = async (req, res) => {
    try {
        if(!req.body.listTurnJson){
            res.send({success: false, message: message.DATA_EMPTY})
            return;
        }
        let listTurn = JSON.parse(req.body.listTurnJson);

        if(listTurn.length > 0 && (!listTurn[0].turn || !listTurn[0].time_begin)){
            res.send({success: false, message: message.DATA_TURN_WRONG})
            return;
        }
        console.log(listTurn);
        for(let i =0; i< listTurn.length; i++){
            console.log(listTurn[i].turn);
            console.log(Number.isInteger(listTurn[i].turn));
            if(!Number.isInteger(listTurn[i].turn)){
                res.send({success: false, message: message.DATATYPE_NOT_NUMBER})
                return;
            }
        }
        let str = "INSERT INTO turn(turn_id, time_begin) VALUES ";
        let {sql, params} = insertArrayToSql(str, listTurn);

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

module.exports.getTurn = async (req, res) => {
    try {
        let sql = "select * from turn";
        let data = await db.execute(sql);
        res.send({
            success: true,
            data
        })

    } catch (e) {
        if( e.code ===  "ER_DUP_ENTRY") e.message = message.DUPLICATED_DATA;
        res.send({
            message: e.message,
            success: false
        });
    }
}

module.exports.deleteTurn = async (req, res) => {
    try{
        if(!req.params.turn_id){
            res.send({success: false, message: message.DATA_EMPTY});
        }
        let sql = "delete from turn where turn_id = ?";
        let params = [req.params.turn_id];
        let data = await db.execute(sql, params);
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