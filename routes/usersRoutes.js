const express = require('express');
const User = require('../models/User');
const router = new express.Router();
const { validate } = require('jsonschema');
const userSchema = require('../schemas/newUser.json');

// GET /users
router.get('/', async function(req, res, next) {
  try {
    const users = await User.getUsers();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});
// POST /users

// GET /users/:username

// PATCH /users/:username

// DELETE /users/:username

module.exports = router;
