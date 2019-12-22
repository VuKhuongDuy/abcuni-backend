var mysql = require('mysql');
const config = {
    HOST: 'localhost',
    PORT: 3000,
    DBHOST: "localhost",
    DBUSER: 'root',
    DBPASSWORD: 'duyvu',
    DB: 'ABCUnit'
}

let con = mysql.createConnection({
    host: config.DBHOST,
    user: config.DBUSER,
    password: config.DBPASSWORD,
    database: config.DB
});

module.exports.config = config;
module.exports.mysql = con;