const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const APIError = require('../helpers/apiError');

class Job {
  // model for enacting crud on jobs

  static async getJobs({ search, min_salary, max_salary }) {
    // Titles and company handles for all jobs, ordered by most recent
    /* Query string params: 
          search: filtered list of titles and company handles
          min_salary: salary greater than val
          max_salary: salary less than max val
      Returning JSON: {jobs: [job, job, job, ...]}
    */
    if (search) {
      const result = await db.query(
        `SELECT *
        FROM jobs
        WHERE salary BETWEEN $2 AND $3
        AND lower(title) LIKE lower($1)
        ORDER BY date_posted DESC`,
        [`%${search}%`, min_salary, max_salary]
      );
      return result.rows;
    } else {
      const result = await db.query(
        `SELECT *
        FROM jobs
        WHERE salary BETWEEN $1 AND $2
        ORDER BY date_posted DESC`,
        [min_salary, max_salary]
      );

      if (result.rows.length === 0) {
        throw new APIError('Bad economy, no jobs', 400);
      }
      return result.rows;
    }
  }

  // POST job
  static async postJob({ title, salary, equity, company_handle, date_posted }) {
    const request = await db.query(
      `SELECT * FROM jobs
      WHERE company_handle = $1`,
      [company_handle]
    );
    console.log('REQUEST', company_handle);
    if (request.rows.length === 0) {
      throw new APIError("Company doesn't exist", 404);
    }

    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [title, salary, equity, company_handle, date_posted]
    );

    return result.rows[0];
  }

  // GET job by id
  static async getJobById(id) {
    if (isNaN(+id)) {
      throw new APIError('Could not find company with that id', 404);
    }
    id = +id;

    const result = await db.query(
      `SELECT * FROM jobs
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new APIError('Could not find company with that id', 404);
    }

    return result.rows[0];
  }

  // PATCH job by id
  static async updateJobById(id, data) {
    if (isNaN(+id)) {
      throw new APIError('Could not find company with that id', 404);
    }
    id = +id;

    const { query, values } = sqlForPartialUpdate(
      'jobs',
      data.values,
      'id',
      id
    );

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new APIError('Could not find company with that id', 404);
    }

    return result.rows[0];
  }

  // DELETE job by id
  static async deleteJobById(id) {
    if (isNaN(+id)) {
      throw new APIError('Could not find company with that id', 404);
    }
    id = +id;

    const result = await db.query(
      `DELETE FROM jobs
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new APIError('Could not find company with that id', 404);
    }
  }
}

module.exports = Job;
