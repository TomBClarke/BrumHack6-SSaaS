const express = require('express'),
  logger = require('morgan'),
  app = express();

app.use(logger('dev'));


var root = require('./routes/root.js');
try {
  // All Pages
  app.use('/', root);
} catch (err) {
  // Handle all errors without crashing the app.
  try {
    next(err);
  } catch (_) {
  }
}


try {
  // Catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  
  // Error handler
  app.use(function (err, req, res, next) {
    console.error(err);
    
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;
    
    // render the error page
    res.status(err.status || 500);
    res.send({
      'err': {
        'message': err.message,
        'err': err
      }
    });
  });
} catch (_) {}

module.exports = app;
