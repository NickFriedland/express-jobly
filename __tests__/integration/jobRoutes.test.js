process.env.NODE_ENV = 'test';

// npm packages
const request = require('supertest');

// app imports
const app = require('../../app');
const db = require('../../db');

// beforeEach should populate each test with a couple of companies and a couple of jobs
//    async / await with db query insert

let google;
let apple;
let job1;
let job2;

beforeEach(async () => {
  let companyResult1 = await db.query(
    `INSERT INTO companies
    (handle, name, num_employees, description)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
    ['goog', 'Google', 100, 'search']
  );

  google = companyResult1.rows[0];

  let companyResult2 = await db.query(
    `INSERT INTO companies
    (handle, name, num_employees, description)
          VALUES ($1, $2, $3, $4)
          RETURNING *`,
    ['appl', 'Apple', 1000, 'Think differently']
  );
  apple = companyResult2.rows[0];

  let jobResult1 = await db.query(
    `INSERT INTO jobs
    (title, salary, equity, company_handle)
          VALUES ($1, $2, $3, $4)
          RETURNING *`,
    ['Software Engineer', 110000, 0.01, 'goog']
  );

  job1 = jobResult1.rows[0];

  let jobResult2 = await db.query(
    `INSERT INTO jobs
    (title, salary, equity, company_handle)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    ['Office Manager', 65000, 0.02, 'appl']
  );

  job2 = jobResult2.rows[0];
});

/* GENERAL:
 **Always test the status code: 200 / 404 for passing /failing
 ** 1-3 tests per describe block / route
 */

// GET route tested in a describe block
describe('GET /jobs', async () => {
  // test get a list of jobs
  test('should return all with no query terms', async () => {
    const response = await request(app).get(`/jobs`);
    const { jobs } = response.body;
    //    confirm 200 status code
    expect(response.statusCode).toBe(200);
    //    confirm results returned with jobs[0]
    expect(jobs).toHaveLength(2);
    //    confirm results have properties with jobs[0].title
    expect(jobs[0].title).toEqual(job2.title);
  });
  // Test salary min value success
  test('should return Software Engineer with min_salary > $66,000', async () => {
    const response = await request(app).get(`/jobs?min_salary=66000`);
    const { jobs } = response.body;
    //    confirm 200 status code
    expect(response.statusCode).toBe(200);
    // expect title to be Software Engineer
    expect(jobs[0].title).toBe('Software Engineer');
    expect(jobs[0].salary).toBe(110000);
  });

  // Test between salary min and max success
  test('should return Office Manager with min_salary > $45,000, max_salary < $100,000', async () => {
    const response = await request(app).get(
      `/jobs?min_salary=45&&max_salary=100000`
    );
    const { jobs } = response.body;
    //    confirm 200 status code

    expect(response.statusCode).toBe(200);
    expect(jobs[0].title).toBe('Office Manager');
  });

  // Test search partial title success
  test('should return Software Engineer with search term Engineer', async () => {
    const response = await request(app).get(`/jobs?search=Engineer`);
    const { jobs } = response.body;
    //    confirm 200 status code
    expect(response.statusCode).toBe(200);
    expect(jobs[0].title).toBe('Software Engineer');
  });

  // Test min greater than max error
  test('should return 404 Error with min_salary > max_salary', async () => {
    const response = await request(app).get(`/jobs?min_salary=5&&max_salary=4`);
    const { error } = response.body;
    //    confirm 404 status code
    expect(response.statusCode).toBe(404);
    expect(error.message).toBe(
      "Minimum salary can't be greater than max salary"
    );
  });

  // Test invalid search term returns empty array
  test('should return empty array with search term Manager', async () => {
    const response = await request(app).get(`/jobs?search=lobotmizer`);
    const { jobs } = response.body;
    //    confirm 200 status code
    expect(response.statusCode).toBe(200);
    expect(jobs).toEqual([]);
  });
});

// GET /:id route tested in a describe block
describe('GET /jobs/:id', async () => {
  // test for 200 success with existing id
  test('should get job when passed valid job id', async () => {
    // console.log('TEST', job1.id);
    const response = await request(app).get(`/jobs/${job1.id}`);
    const { job } = response.body;
    // confirm 200 status code
    expect(response.statusCode).toBe(200);
    expect(job.id).toEqual(job1.id);
  });
  // test for 404 failure with incorrect id
  test('should get 404 error when invalid job id is passed', async () => {
    const response = await request(app).get(`/jobs/foo`);
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect(error.message).toBe('Could not find company with that id');
  });
});

// POST route tested within a describe block
describe('POST /jobs', async () => {
  // test for 200 success with valid form inputs
  test('should create a new job listing when valid inputs provided', async () => {
    const response = await request(app)
      .post(`/jobs`)
      .send({
        title: 'Sultan',
        salary: 60000,
        equity: 0.05,
        company_handle: 'goog'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.job.title).toBe('Sultan');
  });
  // test 404 failure when bad company handle provided
  // test 404 failure when invalid inputs provided
});

// PATCH route tested within a describe block
// describe('PATCH /jobs/:id', async () => {});

// DELETE route tested within a describe block
// describe('DELETE /jobs/:id', async () => {});

// afterEach should tear down the testing environment and reset it for the next test
//    async / await delete all from db

// afterAll should disconnect the db connection
//    async / await db.end()

afterEach(async () => {
  await db.query('DELETE FROM companies');
});

afterAll(async () => {
  await db.end();
});
