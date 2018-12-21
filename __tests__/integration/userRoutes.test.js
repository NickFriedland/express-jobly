process.env.NODE_ENV = 'test';
// npm packages
const request = require('supertest');
const bcrypt = require('bcrypt');

// app imports
const app = require('../../app');
const db = require('../../db');

let joe;
let sally;

beforeEach(async () => {
  let hashedJoe = await bcrypt.hash('joe', 1);
  joe = await db.query(
    `INSERT INTO users (username, password, first_name, last_name, email)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING username, first_name, last_name, email`,
    ['joe88', hashedJoe, 'Joseph', 'Smith', 'joe@gmail.com']
  );

  let hashedSally = await bcrypt.hash('sally', 1);
  sally = await db.query(
    `INSERT INTO users (username, password, first_name, last_name, email)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING username, first_name, last_name, email`,
    ['sally43', hashedSally, 'Sally', 'Smith', 'sally@gmail.com']
  );
  let test = await db.query(`SELECT * FROM users`);
});

describe('GET TO /users', async function() {
  it('should return all users from DB', async function() {
    const response = await request(app).get('/users');
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ users: [joe.rows[0], sally.rows[0]] });
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM users');
});

afterAll(async function() {
  // close db connection
  await db.end();
});
