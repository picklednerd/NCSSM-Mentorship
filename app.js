var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//Database
var configDB = require('./config/database');
mongoose.connect(configDB.url);

require('./models/Users');
var User = mongoose.model('User');

var passwords = require('./config/passwords');

var api = require('./routes/api');
var pages = require('./routes/pages');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

//set headers
app.use(function(req,res,next){
  var headers = req.headers;
  if(headers['authorization'] !== undefined){
    User.getUserFromHeader(headers['authorization'], req, function(){
      if(headers['x-socket'] !== undefined){ //have to nest this. if not, the next() in this function will be called before req.socket can be set. next() has to be a part of the callback of this function so that it isn't called until the user is found and attached to req object
        req.socket = headers['x-socket'];
      }
      next();
    });
  }else{
    next();
  }
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.use('/', api);
app.use('/pages', pages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
