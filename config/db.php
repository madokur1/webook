<?php
/**
 * DATABASE CONNECTION FILE
 * 
 * Location: /config/db.php
 * Purpose: Establishes connection to MySQL database
 * 
 * Instructions:
 * 1. Make sure XAMPP is running (Apache and MySQL)
 * 2. Create a new database in phpMyAdmin called "dreds_transient"
 * 3. Update the variables below if needed (username, password, database name)
 */

// Database credentials
$servername = "localhost";
$db_username = "root";      // XAMPP default username
$db_password = "";          // XAMPP default password (empty)
$database = "dreds_transient";

// Create connection using MySQLi
$conn = new mysqli($servername, $db_username, $db_password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to UTF-8
$conn->set_charset("utf8");

?>
