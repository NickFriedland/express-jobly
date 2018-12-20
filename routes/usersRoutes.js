const express = require('express');
const usersRoutes = express();
const User = require('../models/User');
const router = new express.Router();
const { validate } = require('jsonschema');
const userSchema = require('../schemas/newUser.json');

// GET /users
router.get('/');
// POST /users

// GET /users/:username

// PATCH /users/:username

// DELETE /users/:username

module.exports = usersRoutes;
