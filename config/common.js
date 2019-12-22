module.exports.insertArrayToSql = function (sql, arr) {
    let params = [];

    for (let i = 0; i < arr.length; i++) {
        let enable = true;     
        let sql_child = "(";
        // scan property of an object, then push all property to only one params   
        for (let prop in arr[i]) {

            // variable each of properties
            if (arr[i][prop]!=0 && (!arr[i][prop] || arr[i][prop] === "")){
                // data invalid
                enable = false;
                break;
            }
            params.push(arr[i][prop]);
            sql_child += '?,';
        }
        if(!enable) continue;
        sql_child = sql_child.replace(/,$/gi, '');
        sql_child += '),'
        sql += sql_child;
    }
    sql = sql.replace(/,$/gi, ';');
    return { sql, params };
}