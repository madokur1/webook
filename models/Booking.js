const db = require('../config/database');
const Room = require('./Room');

class Booking {
  static create(userId, roomId, checkInDate, checkOutDate, totalGuests, adults, children, infants, pets, serviceAnimal, totalPrice, notes) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_guests, adults, children, infants, pets, service_animal, total_price, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, roomId, checkInDate, checkOutDate, totalGuests, adults, children, infants, pets, serviceAnimal ? 1 : 0, totalPrice, notes],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, userId, roomId, checkInDate, checkOutDate, totalPrice });
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT b.*, u.full_name, u.email, u.phone, r.name as room_name, r.price_per_night 
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN rooms r ON b.room_id = r.id
         WHERE b.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT b.*, r.name as room_name, r.price_per_night 
         FROM bookings b
         JOIN rooms r ON b.room_id = r.id
         WHERE b.user_id = ?
         ORDER BY b.check_in_date DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `SELECT b.*, u.full_name, u.email, u.phone, r.name as room_name 
                   FROM bookings b
                   JOIN users u ON b.user_id = u.id
                   JOIN rooms r ON b.room_id = r.id WHERE 1=1`;
      const params = [];

      if (filters.bookingStatus) {
        query += ' AND b.booking_status = ?';
        params.push(filters.bookingStatus);
      }

      if (filters.paymentStatus) {
        query += ' AND b.payment_status = ?';
        params.push(filters.paymentStatus);
      }

      if (filters.roomId) {
        query += ' AND b.room_id = ?';
        params.push(filters.roomId);
      }

      query += ' ORDER BY b.check_in_date DESC';

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
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
      db.run(`UPDATE bookings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  static cancel(id, reason = '') {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE bookings SET booking_status = ?, payment_status = ?, notes = ? WHERE id = ?',
        ['cancelled', 'refunded', reason, id],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  }

  static getStats() {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
           COUNT(*) as total_bookings,
           SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as pending_checkin,
           SUM(CASE WHEN booking_status = 'checked_in' THEN 1 ELSE 0 END) as currently_checked_in,
           SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END) as total_revenue
         FROM bookings`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static getAnalyticsSummary() {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];

      db.get(
        `SELECT
           COUNT(*) as total_bookings,
           SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
           SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
           SUM(CASE WHEN booking_status = 'checked_in' THEN 1 ELSE 0 END) as currently_checked_in,
           SUM(total_guests) as total_guests,
           SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END) as total_revenue,
           SUM(CASE WHEN check_in_date <= ? AND check_out_date > ? AND booking_status != 'cancelled' THEN 1 ELSE 0 END) as occupied_rooms
         FROM bookings`,
        [today, today],
        async (err, row) => {
          if (err) return reject(err);

          try {
            const capacity = await Room.getCapacitySummary();
            const totalRooms = capacity.total_rooms || 0;
            const totalCapacity = capacity.total_capacity || 0;
            const occupancyRate = totalRooms > 0 ? Number(((row.occupied_rooms || 0) / totalRooms * 100).toFixed(1)) : 0;

            resolve({
              total_bookings: row.total_bookings || 0,
              pending_bookings: row.pending_bookings || 0,
              confirmed_bookings: row.confirmed_bookings || 0,
              currently_checked_in: row.currently_checked_in || 0,
              total_guests: row.total_guests || 0,
              total_revenue: row.total_revenue || 0,
              occupied_rooms: row.occupied_rooms || 0,
              total_rooms: totalRooms,
              total_capacity: totalCapacity,
              occupancy_rate: occupancyRate
            });
          } catch (capacityError) {
            reject(capacityError);
          }
        }
      );
    });
  }

  static getMonthlyTrends(year = new Date().getFullYear()) {
    return new Promise((resolve, reject) => {
      const yearString = String(year);
      db.all(
        `SELECT strftime('%m', check_in_date) as month,
                COUNT(*) as booking_count,
                SUM(total_price) as revenue
           FROM bookings
          WHERE strftime('%Y', check_in_date) = ?
          GROUP BY month
          ORDER BY month`,
        [yearString],
        (err, rows) => {
          if (err) return reject(err);

          const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const bookingsByMonth = Array(12).fill(0);
          const revenueByMonth = Array(12).fill(0);

          rows.forEach(row => {
            const idx = Number(row.month) - 1;
            if (idx >= 0 && idx < 12) {
              bookingsByMonth[idx] = row.booking_count || 0;
              revenueByMonth[idx] = Number(row.revenue || 0);
            }
          });

          resolve({ labels, bookingsByMonth, revenueByMonth });
        }
      );
    });
  }

  static saveAnalyticsSnapshot(snapshot) {
    return new Promise((resolve, reject) => {
      const {
        snapshot_date,
        total_rooms,
        total_capacity,
        pending_bookings,
        confirmed_bookings,
        currently_checked_in,
        total_revenue,
        total_guests,
        occupancy_rate,
        monthly_bookings,
        monthly_revenue
      } = snapshot;

      db.run(
        `INSERT INTO analytics_snapshots (
           snapshot_date,
           total_rooms,
           total_capacity,
           pending_bookings,
           confirmed_bookings,
           currently_checked_in,
           total_revenue,
           total_guests,
           occupancy_rate,
           monthly_bookings,
           monthly_revenue
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          snapshot_date,
          total_rooms,
          total_capacity,
          pending_bookings,
          confirmed_bookings,
          currently_checked_in,
          total_revenue,
          total_guests,
          occupancy_rate,
          JSON.stringify(monthly_bookings || []),
          JSON.stringify(monthly_revenue || [])
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static saveReportEntry(reportName, reportType, generatedBy, format, summary) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reports (report_name, report_type, generated_by, format, summary) VALUES (?, ?, ?, ?, ?)`,
        [reportName, reportType, generatedBy, format, summary],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static getRecentSnapshots(limit = 5) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, snapshot_date, total_rooms, total_capacity, pending_bookings,
                confirmed_bookings, currently_checked_in, total_revenue,
                total_guests, occupancy_rate, monthly_bookings,
                monthly_revenue, created_at
           FROM analytics_snapshots
          ORDER BY created_at DESC
          LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) return reject(err);
          const snapshots = (rows || []).map((row) => ({
            ...row,
            monthly_bookings: row.monthly_bookings ? JSON.parse(row.monthly_bookings) : [],
            monthly_revenue: row.monthly_revenue ? JSON.parse(row.monthly_revenue) : []
          }));
          resolve(snapshots);
        }
      );
    });
  }
}

module.exports = Booking;
