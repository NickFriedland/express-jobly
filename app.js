/** Express app for jobly. */

const express = require('express');
const app = express();
const APIError = require('./helpers/apiError');

app.use(express.json());

// add logging system

const morgan = require('morgan');
app.use(morgan('tiny'));

// add requires for routes files
const companiesRoutes = require('./routes/companiesRoutes');

app.use('/companies', companiesRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  // all errors that get to here get coerced into API Errors
  if (!(err instanceof APIError)) {
    err = new APIError(err.message, err.status);
  }
  return res.status(err.status).json(err);
});

module.exports = app;
