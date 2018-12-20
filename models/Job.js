const db = require('../db');
const express = require('express');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const APIError = require('../helpers/apiError');

class Job {
  // model for enacting crud on jobs

  static async addJob({ title, salary, equity, company_handle, date_posted }) {
    const company = await db.query(
      `SELECT handle FROM companies
      WHERE handle=$1`,
      [company_handle]
    );

    if (company.rows.length === 0) {
      throw new APIError('Company does not exist', 400);
    }

    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [title, salary, equity, company_handle, date_posted]
    );
    return result.rows[0];
  }

  static async getAllJobs() {
    const result = await db.query(
      `SELECT * FROM jobs ORDER BY date_posted DESC`
    );
    return result.rows;
  }
}

module.exports = Job;
