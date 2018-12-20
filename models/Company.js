const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Company {
  static async displayByEmployeeCount({
    search,
    min_employees = 0,
    max_employees = 99999
  }) {
    try {
      if (search) {
        const result = await db.query(
          `SELECT handle, name 
            FROM companies 
            WHERE num_employees BETWEEN $2 AND $3
            AND lower(name) LIKE lower($1)
            ORDER BY name`,
          [`%${search}%`, min_employees, max_employees]
        );
        return result.rows;
      } else {
        const result = await db.query(
          `SELECT handle, name 
            FROM companies 
            WHERE num_employees BETWEEN $1 AND $2
            ORDER BY name`,
          [min_employees, max_employees]
        );
        return result.rows;
      }
    } catch (error) {
      return error;
    }
  }

  static async createNewCompany(
    handle,
    name,
    num_employees,
    description,
    logo_url
  ) {
    try {
      const company = await db.query(
        `INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
        [handle, name, num_employees, description, logo_url]
      );
      console.log('COMPANY', company);
      return { company };
    } catch (error) {
      return error;
    }
  }

  static async getCompanyByHandle(handle) {
    try {
      const result = await db.query(
        `SELECT * FROM companies WHERE handle = $1`,
        [handle]
      );
      if (result.rows.length === 0) {
        throw new Error('No such user exists');
      }
      return result.rows[0];
    } catch (error) {
      return error;
    }
  }

  // static async getCompanyByName(name) {
  //   try {
  //     const result = await db.query(
  //       `SELECT * FROM companies WHERE handle = $1`,
  //       [handle]
  //     );
  //     if (result.rows.length === 0) {
  //       throw new Error('No such user exists');
  //     }
  //     return result.rows[0];
  //   } catch (error) {
  //     return error;
  //   }
  // }

  static async updateCompany(handle, data) {
    const { query, values } = sqlForPartialUpdate(
      'companies',
      data,
      'handle',
      handle
    );

    const result = await db.query(query, values);
    return result;
  }

  static async deleteCompany(handle) {
    await db.query(
      `DELETE FROM companies
      WHERE handle = $1`,
      [handle]
    );
  }
}

module.exports = Company;
