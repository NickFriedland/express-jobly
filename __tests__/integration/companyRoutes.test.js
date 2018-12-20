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

  it('should return Apple name and handle with only min_employees=200 in query string request to /companies', async function() {
    const response = await request(app).get('/companies?min_employees=200');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ handle: 'aapl', name: 'Apple' }]
    });
  });

  it('should return Google name and handle with only max_employees=200 in query string request to /companies', async function() {
    const response = await request(app).get('/companies?max_employees=200');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ handle: 'goog', name: 'Google' }]
    });
  });

  it('should return Google name and handle with search=goo in query string request to /companies', async function() {
    const response = await request(app).get('/companies?search=goo');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ handle: 'goog', name: 'Google' }]
    });
  });

  it('should return error when min_employees > max_employees', async function() {
    const response = await request(app).get(
      '/companies?min_employees=200&max_employees=100'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: {
        message: 'Min employees must be less than Max employees',
        status: 400
      }
    });
  });

  it('should return empty array when searching for nonexistent term', async function() {
    const response = await request(app).get('/companies?search=papaya');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: []
    });
  });
});

// 1. test that min < max is verified
// 2. test that searching for banana gives empty array

// DATA GETS PASSED, BUT RESULT.ROWS EMPTY
describe('POST /companies', async function() {
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

  it('should throw error if add already existing company', async function() {
    const response = await request(app)
      .post('/companies')
      .send({
        handle: 'goog',
        name: 'Google',
        num_employees: 100,
        description: 'search'
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: {
        message:
          'duplicate key value violates unique constraint "companies_pkey"',
        status: 404
      }
    });
  });

  it('should throw error w/ improper schema', async function() {
    const response = await request(app)
      .post('/companies')
      .send({
        tag: 'fb',
        name: 'Facebook',
        num_employees: 3,
        description: 'cool'
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: { message: 'instance requires property "handle"', status: 400 }
    });
  });

  // what happens if you try to post google again?
  // what happens if the schema validation fails?
});

describe('GET /:handle', async function() {
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

  // ERROR NOT THROWING.  EMPTY OBJ W/ TOP LEVEL KEY COMPANY INSTEAD
  it('GET /:handle with wrong handle should return ERROR', async function() {
    const response = await request(app).get('/companies/amzn');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: { message: 'No such company exists', status: 404 }
    });
  });
});

describe('PATCH /:handle', async function() {
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

  it('PATCH /:handle should throw error w/ improper schema', async function() {
    const response = await request(app)
      .patch('/companies/aapl')
      .send({ num_employees: 5000 });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: { message: 'Invalid company info provided', status: 404 }
    });
  });

  it('PATCH /:handle should throw error w/ wrong handle', async function() {
    const response = await request(app)
      .patch('/companies/fb')
      .send({ num_employees: 5000 });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: { message: 'Invalid company info provided', status: 404 }
    });
  });

  // checking 404 if handle is invalid
});

describe('DELETE /:handle', async function() {
  it('DELETE /:handle with correct handle should return delete message', async function() {
    const response = await request(app).delete('/companies/aapl');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Company deleted'
    });
  });

  it('DELETE /:handle should throw error w/ wrong handle', async function() {
    const response = await request(app).delete('/companies/fb');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: { message: 'Cannot delete nonexistent company', status: 404 }
    });
  });

  // checking 404 if handle is invalid
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close db connection
  await db.end();
});
