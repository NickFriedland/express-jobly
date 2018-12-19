const express = require('express');
const companiesRoutes = express();
const Company = require('../models/Company');
const router = new express.Router();
const { validate } = require('jsonschema');
const companySchema = require('../schemas/newCompany.json');
// GET /companies
router.get('/', async function(req, res, next) {
  try {
    const { search, min_employees, max_employees } = req.query;
    if (min_employees > max_employees) {
      let error;
      error.status = 400;
      next(error);
    }

    const response = await Company.displayByEmployeeCount({
      search,
      min_employees,
      max_employees
    });
    return res.json(response);
  } catch (error) {
    next(error);
  }
});
//  POST /companies
router.post('/', async function(req, res, next) {
  try {
    const result = validate(req.body, companySchema);
    if (!result.valid) {
      let message = result.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      return next(error);
    }
    return res.json(await Company.createNewCompany(req.body));
  } catch (error) {
    next(error);
  }
});
// GET /companies/:handle

// PATCH /companies/:handle

// DELETE /companies/:handle

module.exports = companiesRoutes;
