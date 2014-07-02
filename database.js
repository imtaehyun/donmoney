// database.js
'use strict';
var mysql = require('mysql');

module.exports = {
    connection: mysql.createConnection(process.env.DB_URL),
    selectTransactions: function(callback) {
        var sql = 'SELECT * FROM TRANSACTIONS ORDER BY time DESC';
        var query = this.connection.query(sql, function(err, rows) {
            if (err) callback(err);
            callback(rows);
        });
        console.log(query.sql);
    },
    selectTransaction: function(id, callback) {
        var sql = 'SELECT * FROM TRANSACTIONS WHERE id = ?';
        var query = this.connection.query(sql, [id], function(err, rows) {
            if (err) callback(err);
            callback(rows[0]);
        });
        console.log(query.sql);
    },
    deleteTransaction: function(id, callback) {
        var sql = 'DELETE FROM TRANSACTIONS WHERE id = ?';
        var query = this.connection.query(sql, [id], function(err, result) {
            if (err) callback(err);
            callback(result.affectedRows);
        });
        console.log(query.sql);
    },
    updateTransaction: function(transaction, callback) {
        var sql = 'UPDATE TRANSACTIONS SET type = ?, method = ?, vendor = ?, note = ?, amount = ? WHERE id = ?';
        var query = this.connection.query(sql, [transaction.type, transaction.method, transaction.vendor, transaction.note, transaction.amount, transaction.id], function(err, result) {
            if (err) callback(err);
            callback(result.affectedRows);
        });
        console.log(query.sql);
    },
    insertTransaction: function(transaction, callback) {
        var sql = 'INSERT INTO TRANSACTIONS(type, method, vendor, note, amount, time, reg_dts) VALUES(?, ?, ?, ?, ?, ?, ?)';
    //    console.log('addTransaction : ' + JSON.stringify(transaction));
        var query = this.connection.query(sql, [transaction.type, transaction.method, transaction.vendor, transaction.note, transaction.amount, transaction.time, transaction.reg_dts], function(err, result) {
            if (err) callback(err);
            callback(result.insertId);
        });
        console.log(query.sql);
    }
};
