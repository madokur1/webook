-- SQL script for DRED booking application
-- Includes CREATE TABLE statements, inserts, selects, updates, deletes, and analytics queries.

-- 1) CREATE TABLE statements
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
);

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
);

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
);

CREATE TABLE IF NOT EXISTS house_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS safety_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'not_reported' CHECK(status IN ('available', 'not_reported', 'pending')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cancellation_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  refund_percentage INTEGER,
  days_before_checkin INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
);

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
);

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
);

-- 2) INSERT queries
INSERT INTO users (email, password, full_name, phone, user_type, role)
VALUES ('admin@example.com', 'hashed_password_here', 'Admin User', '123-456-7890', 'admin', 'Manager');

INSERT INTO users (email, password, full_name, phone, user_type)
VALUES ('guest@example.com', 'hashed_password_here', 'Guest User', '555-1234', 'customer');

INSERT INTO rooms (code, name, description, price_per_night, capacity, amenities, image_url, status)
VALUES ('STD1', 'Standard Room', 'Cozy room with queen bed', 80.00, 2, 'WiFi,TV', '/images/room1.jpg', 'available');

INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_guests, adults, children, infants, pets, total_price, payment_status, booking_status, notes)
VALUES (2, 1, '2026-06-01', '2026-06-05', 2, 2, 0, 0, 0, 320.00, 'pending', 'pending', 'Near elevator please');

INSERT INTO house_rules (rule, description, category)
VALUES ('No smoking', 'Smoking is prohibited inside the property', 'Safety');

INSERT INTO safety_features (feature_name, description, status)
VALUES ('Smoke alarm', 'Installed in every room', 'available');

INSERT INTO cancellation_policies (name, description, refund_percentage, days_before_checkin)
VALUES ('Full Refund', 'Full refund when cancelled 7 days before check-in', 100, 7);

INSERT INTO reviews (booking_id, user_id, room_id, rating, comment)
VALUES (1, 2, 1, 5, 'Excellent stay and friendly staff.');

INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_date, status)
VALUES (1, 320.00, 'card', 'TXN0001', datetime('now'), 'completed');

INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details, ip_address)
VALUES (1, 'updated-room-status', 'room', 1, 'Set room to maintenance after fix', '192.168.1.10');

-- 3) SELECT queries
SELECT * FROM users;
SELECT * FROM rooms;
SELECT * FROM bookings;
SELECT * FROM house_rules;
SELECT * FROM safety_features;
SELECT * FROM cancellation_policies;
SELECT * FROM reviews;
SELECT * FROM payments;
SELECT * FROM admin_logs;

SELECT * FROM users WHERE user_type = 'customer' AND status = 'active';
SELECT * FROM rooms WHERE status = 'available' ORDER BY price_per_night;
SELECT * FROM bookings WHERE booking_status = 'confirmed';
SELECT * FROM payments WHERE status = 'completed';
SELECT * FROM house_rules WHERE is_active = 1;
SELECT * FROM cancellation_policies WHERE is_active = 1;

SELECT
  b.id AS booking_id,
  u.full_name AS customer,
  u.email,
  r.name AS room_name,
  r.price_per_night,
  b.check_in_date,
  b.check_out_date,
  b.total_price,
  b.payment_status,
  b.booking_status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN rooms r ON b.room_id = r.id
ORDER BY b.check_in_date DESC;

SELECT
  r.name AS room,
  AVG(rv.rating) AS avg_rating,
  COUNT(rv.id) AS review_count
FROM reviews rv
JOIN rooms r ON rv.room_id = r.id
GROUP BY r.id
ORDER BY avg_rating DESC;

SELECT
  p.id AS payment_id,
  b.id AS booking_id,
  u.full_name AS customer,
  p.amount,
  p.payment_method,
  p.payment_date,
  p.status
FROM payments p
JOIN bookings b ON p.booking_id = b.id
JOIN users u ON b.user_id = u.id;

SELECT *
FROM bookings
WHERE check_in_date >= date('now')
ORDER BY check_in_date;

SELECT *
FROM bookings
WHERE check_in_date BETWEEN date('now') AND date('now', '+30 days')
ORDER BY check_in_date;

-- 4) UPDATE queries
UPDATE users
SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
WHERE id = 2;

UPDATE rooms
SET status = 'maintenance', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE bookings
SET booking_status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE bookings
SET booking_status = 'cancelled', payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE reviews
SET comment = 'Updated review text', rating = 4
WHERE id = 1;

UPDATE safety_features
SET status = 'pending', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE cancellation_policies
SET is_active = 0, updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 5) DELETE queries
DELETE FROM bookings WHERE id = 1;
DELETE FROM reviews WHERE id = 1;
DELETE FROM payments WHERE id = 1;
DELETE FROM house_rules WHERE id = 1;
DELETE FROM safety_features WHERE id = 1;
DELETE FROM cancellation_policies WHERE id = 1;
DELETE FROM admin_logs WHERE id = 1;

DELETE FROM users WHERE id = 2;
DELETE FROM rooms WHERE id = 1;

-- 6) Analytics / report queries
SELECT
  r.name,
  COUNT(b.id) AS booking_count,
  SUM(b.total_price) AS revenue
FROM bookings b
JOIN rooms r ON b.room_id = r.id
WHERE b.payment_status = 'paid'
GROUP BY r.id
ORDER BY revenue DESC;

SELECT booking_status, COUNT(*) AS count
FROM bookings
GROUP BY booking_status;

SELECT
  u.full_name,
  COUNT(b.id) AS total_bookings,
  SUM(b.total_price) AS total_spent
FROM bookings b
JOIN users u ON b.user_id = u.id
GROUP BY u.id
ORDER BY total_spent DESC;

SELECT
  date(check_in_date) AS date,
  COUNT(*) AS bookings_count
FROM bookings
GROUP BY date
ORDER BY date DESC;
