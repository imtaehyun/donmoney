var express = require('express');
var router = express.Router();
var db = require('./database');

router.use(function(req, res, next) {
    console.log('%s %s %s', req.method, req.url, req.path);
    next();
});
router.route('/transactions')
    .get(function(req, res, next) {
        db.selectTransactions(function (result) {
            res.json(result);
        });
    })
    .put(function(req, res, next) {
        console.log('modify body : ' + JSON.stringify(req.body));
        db.updateTransaction(req.body, function (result) {
            res.json(result);
        });
    });

router.route('/transactions/:id')
    .get(function(req, res, next) {
        db.selectTransaction(req.params.id, function (result) {
            res.json(result);
        });
    })
//    .post(function(req, res, next) {
//        // INSERT
//        res.send(200);
//    })
    .delete(function(req, res, next) {
        db.deleteTransaction(req.params.id, function (result) {
            res.json(result);
        });
    });

router.route('*')
    .get(function(req, res, next) {
        res.sendfile('./public/index.html');
    });

module.exports = router;
