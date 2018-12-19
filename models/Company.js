// Placeholder for Company model
const db = require('../db');
const express = require('express');

class Company {
  static async displayByEmployeeCount({
    search,
    min_employees = 0,
    max_employees = Infinity
  }) {
    try {
      if (search) {
        const result = await db.query(
          `SELECT handle, name 
          FROM companies 
          WHERE num_employees BETWEEN $2 AND $3
            AND name LIKE $1
          ORDER BY name`,
          [`%${search}%`, min_employees, max_employees]
        );
        return result;
      } else {
        const result = await db.query(
          `SELECT handle, name 
          FROM companies 
          WHERE num_employees BETWEEN $1 AND $2
          ORDER BY name`,
          [min_employees, max_employees]
        );
        return result;
      }
    } catch (error) {
      return error;
    }
  }

  static async createNewCompany({
    handle,
    name,
    num_employees,
    description,
    logo_url
  }) {
    try {
      const company = await db.query(
        `INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
        [handle, name, num_employees, description, logo_url]
      );
      return { company };
    } catch (error) {
      return error;
    }
  }
}
