process.env.NODE_ENV = 'test';
// npm packages
const request = require('supertest');
const Company = require('../../models/Company');

// app imports
const app = require('../../app');
const db = require('../../db');

let google;
let apple;

beforeEach(async () => {
  let result = await db.query(
    `INSERT INTO companies (handle, name, num_employees, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
    ['goog', 'Google', 100, 'search']
  );
  google = result.rows[0];
  let result2 = await db.query(
    `INSERT INTO companies (handle, name, num_employees, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
    ['aapl', 'Apple', 500, 'computers']
  );
  apple = result2.rows[0];
});

describe('COMPANY ROUTES', async function() {
  it('should return all companies with no query string request to /companies', async function() {
    // Test key in items does not start with "_"
    //
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(200);
    expect({ companies: response.body.companies }).toEqual({
      companies: [
        { handle: 'aapl', name: 'Apple' },
        { handle: 'goog', name: 'Google' }
      ]
    });
  });
});

describe('COMPANY ROUTES', async function() {
  it('should return Apple name and handle with only min_employees=200 in query string request to /companies', async function() {
    const response = await request(app).get('/companies?min_employees=200');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ handle: 'aapl', name: 'Apple' }]
    });
  });
});

describe('COMPANY ROUTES', async function() {
  it('should return Google name and handle with only max_employees=200 in query string request to /companies', async function() {
    const response = await request(app).get('/companies?max_employees=200');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ handle: 'goog', name: 'Google' }]
    });
  });
});

describe('COMPANY ROUTES', async function() {
  it('should return Google name and handle with search=goo in query string request to /companies', async function() {
    const response = await request(app).get('/companies?search=goo');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ handle: 'goog', name: 'Google' }]
    });
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close db connection
  await db.end();
});
