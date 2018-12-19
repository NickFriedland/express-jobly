const express = require('express');
const jobsRoutes = express();
const Job = require('../models/Job');
const router = new express.Router();

// POST /jobs

// GET /jobs

/*
**   search: If the query string parameter is passed, a filtered list of titles and company 
handles should be displayed based on the search term and if the job title includes it.

**  min_salary: If the query string parameter is passed, titles and company handles should 
be displayed that have a salary greater than the value of the query string parameter.

**  min_equity: If the query string parameter is passed, a list of titles and company handles 
should be displayed that have an equity greater than the value of the query string parameter.
*/

// GET /jobs/:id

// PATCH /jobs/:id

// DELETE /jobs/:id

module.exports = jobsRoutes;
