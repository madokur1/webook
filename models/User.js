const db = require('../config/database');
const bcrypt = require('bcryptjs');

// User Model
class User {
  static create(email, password, fullName, phone, userType = 'customer', role = 'Staff', status = 'active') {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) reject(err);

        db.run(
          'INSERT INTO users (email, password, full_name, phone, user_type, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [email, hashedPassword, fullName, phone, userType, role, status],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, email, fullName, phone, userType, role, status });
          }
        );
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, full_name, phone, user_type, role, status, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static findAll(userType = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT id, email, full_name, phone, user_type, role, status, created_at FROM users';
      const params = [];

      if (userType) {
        query += ' WHERE user_type = ?';
        params.push(userType);
      }

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static verifyPassword(hashedPassword, plainPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
        if (err) reject(err);
        else resolve(isMatch);
      });
    });
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.keys(data).forEach(key => {
        if (key !== 'id' && key !== 'password') {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      });

      if (fields.length === 0) {
        resolve(true);
        return;
      }

      values.push(id);
      db.run(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }
}

module.exports = User;
