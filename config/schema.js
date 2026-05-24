const db = require('./database');

const runSQL = (sql) => {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Create all tables
const createTables = async () => {
  await runSQL(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      user_type TEXT NOT NULL CHECK(user_type IN ('admin', 'customer')),
      role TEXT DEFAULT 'Staff',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'banned')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS user_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      price_per_night REAL NOT NULL,
      capacity INTEGER NOT NULL,
      amenities TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'maintenance', 'unavailable')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL,
      total_guests INTEGER NOT NULL,
      adults INTEGER DEFAULT 0,
      children INTEGER DEFAULT 0,
      infants INTEGER DEFAULT 0,
      pets INTEGER DEFAULT 0,
      service_animal BOOLEAN DEFAULT 0,
      total_price REAL NOT NULL,
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),
      booking_status TEXT DEFAULT 'pending' CHECK(booking_status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS house_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule TEXT NOT NULL UNIQUE,
      description TEXT,
      category TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS safety_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feature_name TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT DEFAULT 'not_reported' CHECK(status IN ('available', 'not_reported', 'pending')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS cancellation_policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      refund_percentage INTEGER,
      days_before_checkin INTEGER,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      amount REAL NOT NULL,
      payment_method TEXT,
      transaction_id TEXT UNIQUE,
      payment_date DATETIME,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS analytics_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_date DATE NOT NULL,
      total_rooms INTEGER NOT NULL,
      total_capacity INTEGER NOT NULL,
      pending_bookings INTEGER NOT NULL,
      confirmed_bookings INTEGER NOT NULL,
      currently_checked_in INTEGER NOT NULL,
      total_revenue REAL NOT NULL,
      total_guests INTEGER NOT NULL,
      occupancy_rate REAL NOT NULL,
      monthly_bookings TEXT,
      monthly_revenue TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSQL(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_name TEXT NOT NULL,
      report_type TEXT NOT NULL,
      generated_by TEXT,
      format TEXT NOT NULL CHECK(format IN ('json', 'csv')),
      summary TEXT,
      exported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Seed initial data
const seedInitialData = () => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');

    // Insert house rules
    const rules = [
      { rule: 'Check-in after 2:00 PM', category: 'Check-in', description: 'Guests can check in starting at 2:00 PM' },
      { rule: 'Checkout before 12:00 PM', category: 'Check-out', description: 'Guests must vacate by 12:00 PM' },
      { rule: 'Pets allowed', category: 'Pets', description: 'Pets are allowed with additional fees' }
    ];

    rules.forEach(rule => {
      db.run(
        'INSERT OR IGNORE INTO house_rules (rule, description, category) VALUES (?, ?, ?)',
        [rule.rule, rule.description, rule.category]
      );
    });

    // Insert safety features
    const safetyFeatures = [
      { feature_name: 'Carbon monoxide alarm', status: 'not_reported' },
      { feature_name: 'Smoke alarm', status: 'not_reported' },
      { feature_name: 'Fire extinguisher', status: 'not_reported' },
      { feature_name: 'First aid kit', status: 'not_reported' }
    ];

    safetyFeatures.forEach(feature => {
      db.run(
        'INSERT OR IGNORE INTO safety_features (feature_name, status) VALUES (?, ?)',
        [feature.feature_name, feature.status]
      );
    });

    // Insert cancellation policies
    const policies = [
      { name: 'Free cancellation', refund_percentage: 100, days_before_checkin: 30 },
      { name: 'Standard cancellation', refund_percentage: 75, days_before_checkin: 14 },
      { name: 'Non-refundable', refund_percentage: 0, days_before_checkin: 0 }
    ];

    policies.forEach(policy => {
      db.run(
        'INSERT OR IGNORE INTO cancellation_policies (name, refund_percentage, days_before_checkin) VALUES (?, ?, ?)',
        [policy.name, policy.refund_percentage, policy.days_before_checkin]
      );
    });

    // Insert sample rooms
    const rooms = [
      { name: 'Lorheine Room', price_per_night: 2200, capacity: 20, description: 'Spacious family unit for large groups', amenities: 'AC, WiFi, TV, Kitchen' },
      { name: 'Elisse Room', price_per_night: 2200, capacity: 10, description: 'Comfortable mid-size room', amenities: 'AC, WiFi, TV, Bathroom' },
      { name: 'Arco Room', price_per_night: 2200, capacity: 8, description: 'Cozy room for small groups', amenities: 'AC, WiFi, TV' },
      { name: 'Family Suite', price_per_night: 2200, capacity: 14, description: 'Perfect for families with children', amenities: 'AC, WiFi, TV, Kitchen, Crib' },
      { name: 'Deluxe Room', price_per_night: 2200, capacity: 6, description: 'Premium room with deluxe amenities', amenities: 'AC, WiFi, TV, Bathroom, Minibar' }
    ];

    rooms.forEach(room => {
      db.run(
        'INSERT OR IGNORE INTO rooms (name, description, price_per_night, capacity, amenities) VALUES (?, ?, ?, ?, ?)',
        [room.name, room.description, room.price_per_night, room.capacity, room.amenities]
      );
    });

    // Insert sample customer users
    const sampleCustomers = [
      { email: 'john.doe@example.com', password: 'customer123', full_name: 'John Doe', phone: '09171234567' },
      { email: 'jane.smith@example.com', password: 'customer123', full_name: 'Jane Smith', phone: '09179876543' },
      { email: 'alice.johnson@example.com', password: 'customer123', full_name: 'Alice Johnson', phone: '09173456789' },
      { email: 'bob.brown@example.com', password: 'customer123', full_name: 'Bob Brown', phone: '09170001122' },
      { email: 'maria.lee@example.com', password: 'customer123', full_name: 'Maria Lee', phone: '09179887766' }
    ];

    // Hash password and insert customers with bookings
    Promise.all(
      sampleCustomers.map(customer => {
        return new Promise((res) => {
          bcrypt.hash(customer.password, 10, (err, hashedPassword) => {
            if (err) return res();
            
            db.run(
              'INSERT OR IGNORE INTO users (email, password, full_name, phone, user_type) VALUES (?, ?, ?, ?, ?)',
              [customer.email, hashedPassword, customer.full_name, customer.phone, 'customer'],
              function() {
                res(this.lastID);
              }
            );
          });
        });
      })
    ).then(userIds => {
      // Insert sample bookings after customers are created
      const sampleBookings = [
        { user_id: 1, room_id: 1, check_in: '2025-05-25', check_out: '2025-05-27', total_guests: 20, adults: 18, children: 2, infants: 0, pets: 0, price: 4400, status: 'confirmed' },
        { user_id: 2, room_id: 3, check_in: '2025-05-24', check_out: '2025-05-25', total_guests: 8, adults: 8, children: 0, infants: 0, pets: 0, price: 2200, status: 'confirmed' },
        { user_id: 3, room_id: 2, check_in: '2025-05-26', check_out: '2025-05-29', total_guests: 10, adults: 8, children: 2, infants: 0, pets: 0, price: 6600, status: 'confirmed' },
        { user_id: 4, room_id: 4, check_in: '2025-05-28', check_out: '2025-06-02', total_guests: 14, adults: 12, children: 2, infants: 0, pets: 1, price: 11000, status: 'confirmed' },
        { user_id: 5, room_id: 5, check_in: '2025-05-30', check_out: '2025-06-01', total_guests: 6, adults: 6, children: 0, infants: 0, pets: 0, price: 4400, status: 'confirmed' }
      ];

      sampleBookings.forEach(booking => {
        db.run(
          'INSERT OR IGNORE INTO bookings (user_id, room_id, check_in_date, check_out_date, total_guests, adults, children, infants, pets, total_price, booking_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [booking.user_id, booking.room_id, booking.check_in, booking.check_out, booking.total_guests, booking.adults, booking.children, booking.infants, booking.pets, booking.price, booking.status]
        );
      });

      resolve();
    });
  });
};

module.exports = { createTables, seedInitialData };
