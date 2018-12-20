const express = require('express');
const Company = require('../models/Company');
const router = new express.Router();
const { validate } = require('jsonschema');
const companySchema = require('../schemas/newCompany.json');
const patchCompany = require('../schemas/patchCompany.json');

// GET /companies
router.get('/', async function(req, res, next) {
  try {
    const { search, min_employees, max_employees } = req.query;
    if (min_employees && max_employees && min_employees > max_employees) {
      let error;
      error.status = 400;
      return next(error);
      console('PAST 400 ERROR');
    }

    const companies = await Company.displayByEmployeeCount({
      search,
      min_employees,
      max_employees
    });
    console.log('COMPANIES', companies);
    return res.json({ companies });
  } catch (error) {
    return next(error);
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
router.get('/:handle', async function(req, res, next) {
  try {
    const { handle } = req.params;
    const company = await Company.getCompanyByHandle(handle);
    return res.json({ company });
  } catch (error) {
    next(error);
  }
});
// PATCH /companies/:handle

router.patch('/:handle', async function(req, res, next) {
  try {
    const result = validate(req.body, patchCompany);
    if (!result.valid) {
      throw new Error('Invalid company info provided');
    }
    const response = Company.updateCompany(handle, req.body);
    return res.json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /companies/:handle

router.delete('/:handle', async function(req, res, next) {
  try {
    Company.deleteCompany(req.params.handle);
    return res.json({ message: ' Company deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
