var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var elastic = require('./elasticsearch');
// Get Editor for input
app.get('/editor',function(req,res){
  res.render('editor');
});

/* GET suggestions */
app.get('/suggest/:input', function (req, res, next) {
  elastic.getSuggestions(req.params.input).then(function (result) { res.json(result) });
});

/* POST document to be indexed */
app.post('/index', function (req, res, next) {
  elastic.addDocument(req.body).then(function (result) { res.json(result) });
});

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var elastic = require('./elasticsearch');
elastic.indexExists().then(function (exists) {
  if (exists) {
    return elastic.deleteIndex();
  }
}).then(function () {
  return elastic.initIndex().then(elastic.initMapping).then(function () {
    //Add a few book titles for the autocomplete
    //elasticsearch offers a bulk functionality as well, but this is for a different time
    var promises = [
      'Thing Explainer',
      'The Internet Is a Playground',
      'The Pragmatic Programmer',
      'The Hitchhikers Guide to the Galaxy',
      'Trial of the Clone',
      'All Quiet on the Western Front',
      'The Animal Farm',
      'The Circle'
    ].map(function (bookTitle) {
      return elastic.addDocument({
        title: bookTitle,
        content: bookTitle + " content!",
        metadata: {
          titleLength: bookTitle.length
        }
      });
    });
    return Promise.all(promises);
  });
});

module.exports = app;