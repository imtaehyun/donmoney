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

// configuration
app.use(express.static(__dirname + '/public'));
app.use(logger());
app.use(bodyParser());
var connection = mysql.createConnection('mysql://root:mi15chael8.@nezz.pe.kr:3306/dailycost?zeroDateTimeBehavior=convertToNull');

// listen
app.listen(80);
console.log("App listening on port 3000");

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
    console.log(req.params.sms);
    AnalysisService.textAnalyze(req.params.sms, function (result) {
        console.log(JSON.stringify(result));
    });
});

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
    this.time = Date.now();
    this.reg_dts = Date.now();
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
        if (text.indexOf('삼성카드')) {
            t.method = '20';
            t.vendor = 'samsung';
            t.type = '20';
            try {
                t.time = moment(splitText[1], 'MM/DD HH:mm');
            } catch (e) {
                t.time = Date.now();
            }
            t.amount = splitText[2].replaceAll('[^0-9]', '');
            t.note = splitText[4];
        } else if (text.indexOf('씨티카드')) {
            t.method = '20';
            t.vendor = 'citi';
            t.type = '20';
            try {
                t.time = moment(splitText[2], 'MM/DD HH:mm');
            } catch (e) {
                t.time = Date.now();
            }
            t.amount = splitText[3].replaceAll('[^0-9]', '');
            t.note = splitText[5];
        } else {
            t.method = '10';
            t.amount = text.replaceAll('[^0-9]', '');
            t.note = text.replaceAll('[0-9]', '');
            t.time = Date.now();
        }
        callback(t);
    }    
};

// db functions
var listTransaction = function(callback) {
    var sql = 'SELECT * FROM TRANSACTIONS ORDER BY time DESC';
    connection.query(sql, function(err, rows) {
        if (err) callback(err);
        callback(rows);
    });
};

var getTransaction = function(id, callback) {
    var sql = 'SELECT * FROM TRANSACTIONS WHERE id = ?';
    connection.query(sql, [id], function(err, rows) {
        if (err) callback(err);
        callback(rows[0]);
    });
};

var delTransaction = function(id, callback) {
    var sql = 'DELETE FROM TRANSACTIONS WHERE id = ?';
    connection.query(sql, [id], function(err, result) {
        if (err) callback(err);
        callback(result.affectedRows);
    });
};

var updateTransaction = function(transaction, callback) {
    var sql = 'UPDATE TRANSACTIONS SET type = ?, method = ?, vendor = ?, note = ?, amount = ? WHERE id = ?';
    connection.query(sql, [transaction.type, transaction.method, transaction.vendor, transaction.note, transaction.amount, transaction.id], function(err, result) {
        if (err) callback(err);
        callback(result.affectedRows);
    });
};

var addTransaction = function(transaction, callback) {
    var sql = 'INSERT INTO TRANSACTIONS(type, method, vendor, note, amount, time, reg_dts) VALUES(?,?,?,?,?,?,?)';
    connection.query(sql, [transaction.type, transaction.method, transaction.vendor, transaction.note, transaction.amount, transaction.time, transaction.req_dts], function(err, result) {
        if (err) callback(err);
        callback(result.affectedRows);
    });
};