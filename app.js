var express = require('express');
var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_zhangyin',
    password: '6395',
    database: 'cs340_zhangyin'
});

var path = require('path');
var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 9365);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));


app.get('/', function (req, res) {
    res.render('home');
});

app.get('/return-data', function (req, res, next) {
    var context = {};
    pool.query('SELECT catID, catName, catDescription FROM Categories ORDER BY catName', function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});


// insert a new entry into the table
app.post('/insert', function (req, res, next) {
    var context = {};
    //console.log("server query", req.query);
    pool.query("INSERT INTO Categories (`catName`, `catDescription`) VALUES (?, ?)",
        [req.query.catName, req.query.catDescription, req.query.weight], function (err, result) {
            if (err) {
                next(err);
                return;
            }
        });
    pool.query('SELECT catName, catDescription FROM Categories ORDER BY catName', function (err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;
        res.send(context);
    });
});

app.post('/update', function (req, res, next) {
    var context = {};
    pool.query("UPDATE Categories SET catName=?, catDescription=? WHERE catID = ?", [req.body.catName, req.body.catDescription, req.body.catID], function (err, result) {
        if (err) {
            next(err);
            return;
        }
        pool.query("SELECT * FROM Categories ORDER BY 'catName' DESC", function (err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            res.type('application/json');
            res.send(rows);
        });
    });
});


app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('App started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

