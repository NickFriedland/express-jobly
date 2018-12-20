process.env.NODE_ENV = 'test';
// npm packages
const request = require('supertest');

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

describe('GET TO /companies', async function() {
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

// DATA GETS PASSED, BUT RESULT.ROWS EMPTY
describe('COMPANY ROUTES', async function() {
  it('/post should add company with correct schema', async function() {
    const response = await request(app)
      .post('/companies')
      .send({
        handle: 'amzn',
        name: 'Amazon',
        num_employees: 1000,
        description: 'Shopping'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        handle: 'amzn',
        name: 'Amazon',
        num_employees: 1000,
        description: 'Shopping',
        logo_url: null
      }
    });
  });
});

describe('COMPANY ROUTES', async function() {
  it('GET /:handle should return that company data', async function() {
    const response = await request(app).get('/companies/aapl');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        handle: 'aapl',
        name: 'Apple',
        num_employees: 500,
        description: 'computers',
        logo_url: null
      }
    });
  });
});

// ERROR NOT THROWING.  EMPTY OBJ W/ TOP LEVEL KEY COMPANY INSTEAD
describe('COMPANY ROUTES', async function() {
  it('GET /:handle with wrong handle should return ERROR', async function() {
    const response = await request(app).get('/companies/amzn');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: { message: 'No such company exists', status: 404 }
    });
  });
});

describe('COMPANY ROUTES', async function() {
  it('PATCH /:handle with correct handle and data should return updated company', async function() {
    const response = await request(app)
      .patch('/companies/aapl')
      .send({ values: { num_employees: 5000 } });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        handle: 'aapl',
        name: 'Apple',
        num_employees: 5000,
        description: 'computers',
        logo_url: null
      }
    });
  });
});

describe('COMPANY ROUTES', async function() {
  it('PATCH /:handle should throw error w/ improper schema', async function() {
    const response = await request(app)
      .patch('/companies/aapl')
      .send({ num_employees: 5000 });
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: { message: 'Invalid company info provided', status: 500 }
    });
  });
});

describe('COMPANY ROUTES', async function() {
  it('DELETE /:handle with correct handle should return delete message', async function() {
    const response = await request(app).delete('/companies/aapl');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Company deleted'
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
