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
    }

    const companies = await Company.displayByEmployeeCount({
      search,
      min_employees,
      max_employees
    });
    return res.json({ companies });
  } catch (error) {
    return next(error);
  }
});
//  POST /companies
router.post('/', async function(req, res, next) {
  try {
    const result = validate(req.body, companySchema);
    console.log('IS VALID?', result.valid);
    console.log('REQ.BODY', req.body);
    if (!result.valid) {
      let message = result.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      return next(error);
    }
    return res.json({ company: await Company.createNewCompany(req.body) });
  } catch (error) {
    return next(error);
  }
});
// GET /companies/:handle
router.get('/:handle', async function(req, res, next) {
  try {
    const { handle } = req.params;
    const company = await Company.getCompanyByHandle(handle);
    return res.json({ company });
  } catch (error) {
    return next(error);
  }
});
// PATCH /companies/:handle

router.patch('/:handle', async function(req, res, next) {
  try {
    const result = validate(req.body, patchCompany);
    if (!result.valid) {
      throw new Error('Invalid company info provided');
    }
    const company = await Company.updateCompany(req.params.handle, req.body);
    return res.json({ company });
  } catch (error) {
    return next(error);
  }
});

// DELETE /companies/:handle

router.delete('/:handle', async function(req, res, next) {
  try {
    Company.deleteCompany(req.params.handle);
    return res.json({ message: 'Company deleted' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
