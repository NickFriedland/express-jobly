const express = require('express');
const Job = require('../models/Job');
const { validate } = require('jsonschema');
const jobSchema = require('../schemas/newJob.json');
const patchJob = require('../schemas/patchJob');
const APIError = require('../helpers/apiError');

const router = new express.Router();

// GET /jobs
router.get('/', async function(req, res, next) {
  try {
    // create params from query string for search, min_salary, max_salary
    const { search, min_salary, max_salary } = req.query;
    // if min_salary > max_salary when both are present, throw new APIError
    if (min_salary && max_salary && min_salary > max_salary) {
      throw new APIError(
        "Minimum salary can\n't be greater than max salary",
        404
      );
    }

    // return var for Job results
    return res.json({
      jobs: await Job.getJobs({ search, min_salary, max_salary })
    });
  } catch (error) {
    return next(error);
  }
});

// POST /job
router.post('/', async function(req, res, next) {
  try {
    // create vars from req.body vals
    const result = validate(req.body, jobSchema);

    if (!result.valid) {
      const message = result.errors.map(e => e.stack);
      throw new APIError(message, 404);
    }

    return res.json({ job: await Job.postJob(req.body) });
  } catch (error) {
    return next(error);
  }
});

// GET /jobs/:id
router.get('/:id', async function(req, res, next) {
  try {
    // return job obj made from var
    return res.json({ job: await Job.getJobById(req.params.id) });
  } catch (error) {
    return next(error);
  }
});

// PATCH /jobs/:id
router.patch('/:id', async function(req, res, next) {
  try {
    const result = validate(req.body, patchJob);

    if (!result.valid) {
      const message = result.errors.map(e => e.stack);
      throw new APIError(message, 404);
    }

    // return job obj with job data
    return res.json({ job: await Job.updateJobById(req.params.id, req.body) });
  } catch (error) {
    return next(error);
  }
});

// DELETE /jobs/:id
router.delete('/:id', async function(req, res, next) {
  try {
    // call delete model method with req.query
    await Job.deleteJobById(req.params.id);

    return res.json({ message: 'Job deleted.' });
  } catch (error) {
    return next(error);
  }
});

router.module.exports = router;
