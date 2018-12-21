/** Express app for jobly. */
const express = require('express');
const APIError = require('./helpers/apiError');
const app = express();

app.use(express.json());

// add logging system

const morgan = require('morgan');
app.use(morgan('tiny'));

// add requires for routes files
const companiesRoutes = require('./routes/companiesRoutes');
const usersRoutes = require('./routes/usersRoutes');
const jobsRoutes = require('./routes/jobsRoutes');

app.use('/companies', companiesRoutes);
app.use('/users', usersRoutes);
app.use('/jobs', jobsRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new APIError(`${req.path} is not a valid endpoint`, 404);
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
