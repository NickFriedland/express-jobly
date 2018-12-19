process.env.NODE_ENV = 'test';
// npm packages
const request = require('supertest');
const Company = require('../../models/Company');

// app imports
const app = require('../../../app');
const db = require('../../../db');

let google

beforeEach(async () => {
  let result = await db.query(
    `INSERT INTO companies (handle, name, num_employees, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
    ['goog', 'Google', 100, 'search']
  );
  let google = result.rows[0]
});

describe('COMPANY ROUTES', () => {
  it('should return companies with request to /companies', function() {
    // Test key in items does not start with "_"
    //
    const response = await request(app.get('/companies'))
    expect(response).toEqual({ company: google });
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query("DELETE FROM companies");
});

afterAll(async function() {
  // close db connection
  await db.end();
});