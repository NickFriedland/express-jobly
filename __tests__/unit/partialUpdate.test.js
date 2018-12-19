const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', function() {
    // Test key in items does not start with "_"
    //
    const queryString = `UPDATE users SET firstName=$1 WHERE id=$2 RETURNING *`;
    expect(
      sqlForPartialUpdate('users', { firstName: 'Elie' }, 'id', 100)
    ).toEqual({ query: queryString, values: ['Elie', 100] });
  });

  it('should generate a proper partial update query with multiple fields', function() {
    // Test key in items does not start with "_"
    //
    const queryString = `UPDATE users SET firstName=$1, lastName=$2 WHERE id=$3 RETURNING *`;
    expect(
      sqlForPartialUpdate(
        'users',
        { firstName: 'Elie', lastName: 'Schoppik' },
        'id',
        100
      )
    ).toEqual({ query: queryString, values: ['Elie', 'Schoppik', 100] });
  });

  it('should generate a proper partial update query, ignoring columns that start with "_" ', function() {
    const queryString = `UPDATE users SET firstName=$1, lastName=$2 WHERE id=$3 RETURNING *`;
    expect(
      sqlForPartialUpdate(
        'users',
        { firstName: 'Elie', lastName: 'Schoppik', _token: 'token' },
        'id',
        100
      )
    ).toEqual({ query: queryString, values: ['Elie', 'Schoppik', 100] });
  });
});
