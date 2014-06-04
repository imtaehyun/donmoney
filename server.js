// server.js
'use strict';

// set up
require('newrelic');
var express = require('express');
var logger  = require('morgan');
var bodyParser = require('body-parser');
var app     = express();
var mysql   = require('mysql');

// configuration
app.use(express.static(__dirname + '/public'));
app.use(logger());
app.use(bodyParser());
var connection = mysql.createConnection('mysql://root:mi15chael8.@nezz.pe.kr:3306/dailycost?zeroDateTimeBehavior=convertToNull');

// listen
app.listen(80);
console.log("App listening on port 3000");

// routes
app.get('/list', function(req, res) {
    listTransaction(function(result) {
        res.json(result);
    });
});

app.get('/get/:id', function(req, res) {
    getTransaction(req.params.id, function(result) {
        res.json(result);
    });
});

app.post('/modify', function(req, res) {
    console.log('modify body : ' + JSON.stringify(req.body));
    updateTransaction(req.body, function(result) {
        res.json(result);
    });
});

app.post('/delete/:id', function(req, res) {
    delTransaction(req.params.id, function(result) {
        res.json(result);
    });
});

// application

app.get('*', function(req, res) {
   res.sendfile('./public/index.html');
});

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