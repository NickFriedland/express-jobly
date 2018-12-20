const db = require('../db');
const express = require('express');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const APIError = require('../helpers/apiError');

class User {
  static async getUsers() {
    const result = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    );
  }
}

module.exports = User;
