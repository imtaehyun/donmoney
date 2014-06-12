/*jslint node: true*/
// server.js
'use strict';

// set up
require('newrelic');
var express     = require('express');
var logger      = require('morgan');
var bodyParser  = require('body-parser');
var app         = express();
var mysql       = require('mysql');
var moment      = require('moment');
var CronJob     = require('cron').CronJob;
var shell       = require('shelljs');

// configuration
app.use(express.static(__dirname + '/public'));
app.use(logger());
app.use(bodyParser());
var connection = mysql.createConnection('mysql://root:mi15chael8.@nezz.pe.kr:3306/dailycost?zeroDateTimeBehavior=convertToNull');

// listen
app.listen(80);
console.log("App listening on port 80");

// routes
app.get('/api/list', function (req, res) {
    listTransaction(function (result) {
        res.json(result);
    });
});

app.get('/api/get/:id', function (req, res) {
    getTransaction(req.params.id, function (result) {
        res.json(result);
    });
});

app.post('/api/modify', function (req, res) {
    console.log('modify body : ' + JSON.stringify(req.body));
    updateTransaction(req.body, function (result) {
        res.json(result);
    });
});

app.post('/api/delete/:id', function (req, res) {
    delTransaction(req.params.id, function (result) {
        res.json(result);
    });
});

// application
app.get('/expense', function (req, res) {

    if (req.query.sms !== undefined) {
        AnalysisService.textAnalyze(req.query.sms, function (analyzedData) {
            console.log(JSON.stringify(analyzedData));
            addTransaction(analyzedData, function(result) {
                if (result > 0) res.redirect('/#/detail/' + result);
                else {
                    console.log(result);
                    res.send('err');
                }
            });
        });
    } else {
        var t = new Transaction();
        t.type = '20';
        t.method = '10';
        t.amount = req.query.amount;
        t.note = req.query.note;
        try {
            t.time = moment(req.query.time, 'YYYY/MM/DD HH:mm:ss').format();
        } catch (e) {
            t.time = moment().format();
        }
        addTransaction(t, function(result) {
            if (result > 0) res.redirect('/#/detail/' + result);
            else {
                console.log(result);
                res.send('err');
            }
        });
    }

});

app.get('/income', function (req, res) {
    var t = new Transaction();
    t.type = '10';
    t.method = '10';
    t.amount = req.query.amount;
    t.note = req.query.note;
    try {
        t.time = moment(req.query.time, 'YYYY/MM/DD HH:mm:ss').format();
    } catch (e) {
        t.time = moment().format();
    }
    addTransaction(t, function(result) {
        if (result > 0) res.redirect('/#/detail/' + result);
        else {
            console.log(result);
            res.send('err');
        }
    });
})

app.get('*', function(req, res) {
   res.sendfile('./public/index.html');
});

//  model
function Transaction () {
    this.note = '';
    this.type = '20'; //10: income, 20: expense
    this.method = '20'; //10: cash, 20: card
    this.vendor = '';
    this.amount = 0;
    this.time = moment().format();
}

// services

var AnalysisService = {
    textAnalyze: function (text, callback) {
        console.log(text);
        var splitText = text.split(/\r\n|\n|\r/);
        
        for (var i in splitText) {
            console.log('txt[' + i + '] : ' + splitText[i]);
        }
        
        var t = new Transaction();
        if (text.indexOf('삼성카드') > -1) {
            t.method = '20';
            t.vendor = 'samsung';
            t.type = '20';
            try {
                t.time = moment(splitText[1], 'MM/DD HH:mm').format();
            } catch (e) {
                t.time = moment().format();
            }
            t.amount = splitText[2].replace(/[^0-9]/gi, '');
            t.note = splitText[4];
        } else if (text.indexOf('씨티카드') > -1) {
            t.method = '20';
            t.vendor = 'citi';
            t.type = '20';
            try {
                t.time = moment(splitText[2], 'MM/DD HH:mm').format();
            } catch (e) {
                t.time = moment().format();
            }
            t.amount = splitText[3].replace(/[^0-9]/gi, '');
            t.note = splitText[5];
        } else {
            t.method = '10';
            t.amount = text.replace(/[^0-9]/gi, '');
            t.note = text.replace(/[0-9]/gi, '');
            t.time = moment().format();
        }
        callback(t);
    }    
};

// db functions
var listTransaction = function(callback) {
    var sql = 'SELECT * FROM TRANSACTIONS ORDER BY time DESC';
    var query = connection.query(sql, function(err, rows) {
        if (err) callback(err);
        callback(rows);
    });
    console.log(query.sql);
};

var getTransaction = function(id, callback) {
    var sql = 'SELECT * FROM TRANSACTIONS WHERE id = ?';
    var query = connection.query(sql, [id], function(err, rows) {
        if (err) callback(err);
        callback(rows[0]);
    });
    console.log(query.sql);
};

var delTransaction = function(id, callback) {
    var sql = 'DELETE FROM TRANSACTIONS WHERE id = ?';
    var query = connection.query(sql, [id], function(err, result) {
        if (err) callback(err);
        callback(result.affectedRows);
    });
    console.log(query.sql);
};

var updateTransaction = function(transaction, callback) {
    var sql = 'UPDATE TRANSACTIONS SET type = ?, method = ?, vendor = ?, note = ?, amount = ? WHERE id = ?';
    var query = connection.query(sql, [transaction.type, transaction.method, transaction.vendor, transaction.note, transaction.amount, transaction.id], function(err, result) {
        if (err) callback(err);
        callback(result.affectedRows);
    });
    console.log(query.sql);
};

var addTransaction = function(transaction, callback) {
    var sql = 'INSERT INTO TRANSACTIONS(type, method, vendor, note, amount, time) VALUES(?, ?, ?, ?, ?, ?)';
//    console.log('addTransaction : ' + JSON.stringify(transaction));
    var query = connection.query(sql, [transaction.type, transaction.method, transaction.vendor, transaction.note, transaction.amount, transaction.time], function(err, result) {
        if (err) callback(err);
        callback(result.insertId);
    });
    console.log(query.sql);
};

new CronJob('00 00 01 * * *', function () {
    var time = moment().format('YYYYMMDD_HHmmss');
    shell.exec('mysqldump --user="root" --password="mi15chael8." dailycost TRANSACTIONS > /root/donmoney-web/backup/db/db_' + time + '.sql', function (code, output) {
        if (code == 0) {
            console.log('db_' + time + '.sql');
        } else {
            console.log('db backup err: ', output);
        }
    });
});