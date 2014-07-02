/*jslint node: true*/
// server.js
'use strict';

// set up
if (process.env.NODE_ENV === 'production') require('newrelic');
var express     = require('express');
var logger      = require('morgan');
var bodyParser  = require('body-parser');
var app         = express();
var http        = require('http');
var router      = require('./router');
var db          = require('./database');
var moment      = require('moment');
var CronJob     = require('cron').CronJob;
var shell       = require('shelljs');

// configuration
app.use(express.static(__dirname + '/public'));
app.use(logger());
app.use(bodyParser());
app.set('port', process.env.PORT || 3000)

// listen
http.createServer(app).listen(app.get('port'), function() {
    console.log('Server listening on port ' + app.get('port'));
});

app.use('/', router);

// application
app.get('/expense', function (req, res) {

    if (req.query.sms !== undefined) {
        AnalysisService.textAnalyze(req.query.sms, function (analyzedData) {
            console.log(JSON.stringify(analyzedData));
            db.insertTransaction(analyzedData, function(result) {
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
        db.insertTransaction(t, function(result) {
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
    db.insertTransaction(t, function(result) {
        if (result > 0) res.redirect('/#/detail/' + result);
        else {
            console.log(result);
            res.send('err');
        }
    });
})

//  model
function Transaction () {
    this.note = '';
    this.type = '20'; //10: income, 20: expense
    this.method = '20'; //10: cash, 20: card
    this.vendor = '';
    this.amount = 0;
    this.time = moment().format();
    this.reg_dts = moment().format();
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

new CronJob('00 00 00 * * *', function () {
    var time = moment().format('YYYYMMDD_HHmmss');
    shell.exec('mysqldump --user="root" --password="mi15chael8." dailycost TRANSACTIONS > /root/donmoney-web/backup/db/db_' + time + '.sql', function (code, output) {
        if (code == 0) {
            console.log('db_' + time + '.sql');
        } else {
            console.log('db backup err: ', output);
        }
    });
}, null, true, 'Asia/Seoul');
