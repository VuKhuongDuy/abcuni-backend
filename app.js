const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { config } = require('./config/config');
const jsonwebtoken = require("jsonwebtoken");
const { status_code } = require('./config/status_code');
const {message} = require('./config/message');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    if (
        (req.url.indexOf("login") >= 0) &&
        req.method === "POST"
    ) {
        req.user = undefined;
        next();
    } else if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "JWT"
    ) {
        jsonwebtoken.verify(
            req.headers.authorization.split(" ")[1],
            "RESTFULAPIs",
            function (err, decode) {
                if (err){
                    req.user = undefined;
                    req.user.isAdmin = undefined;
                }
                req.user = decode;
                next();
            }
        );
    } else {
        res.status(status_code.AUTH).send({
            message: "Unauthorized user!"
        });
    }
})

app.use(function (req, res, next){
    if (req.url.indexOf('admin') >= 0 && !req.user.isAdmin) {
        res.send({
            success: false,
            message: message.NOT_ADMIN
        })
    }else{
        next();
    }
})

app.use('', require('./router/index.js'));

app.listen(3000, function () { console.log(`Listening on port ${config.PORT} and host ${config.HOST}`) })

module.exports = app;