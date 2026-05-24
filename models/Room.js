const db = require('../config/database');

class Room {
  static create(code, name, description, pricePerNight, capacity, amenities, imageUrl, status = 'available') {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO rooms (code, name, description, price_per_night, capacity, amenities, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [code, name, description, pricePerNight, capacity, amenities, imageUrl, status],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, code, name, description, pricePerNight, capacity, amenities, imageUrl, status });
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findAll(status = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM rooms';
      const params = [];

      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY name ASC';

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static getCapacitySummary() {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total_rooms, COALESCE(SUM(capacity), 0) as total_capacity FROM rooms',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || { total_rooms: 0, total_capacity: 0 });
        }
      );
    });
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.keys(data).forEach(key => {
        if (key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      });

      if (fields.length === 0) {
        resolve(true);
        return;
      }

      values.push(id);
      db.run(`UPDATE rooms SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM rooms WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  static getAvailability(roomId, checkInDate, checkOutDate) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as booking_count FROM bookings 
         WHERE room_id = ? 
         AND booking_status != 'cancelled'
         AND NOT (check_out_date <= ? OR check_in_date >= ?)`,
        [roomId, checkInDate, checkOutDate],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.booking_count === 0);
        }
      );
    });
  }
}

module.exports = Room;
