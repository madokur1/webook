-- DATABASE SETUP SCRIPT FOR DRED'S TRANSIENT
-- 
-- Instructions:
-- 1. Open phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Create a new database called "dreds_transient"
-- 3. Click on the database, go to the "SQL" tab
-- 4. Copy and paste this entire script, then click "Go"
-- 5. The users table will be created automatically

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add index for faster email lookups
CREATE INDEX idx_email ON users(email);

-- Example of viewing all users
-- SELECT * FROM users;
