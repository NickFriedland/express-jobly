const db = require('../db');
const express = require('express');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Job {
  // model for enacting crud on jobs

  static async getAllJobs() {
    await db.query(``);
  }
}

module.exports = Job;
