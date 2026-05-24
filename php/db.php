<?php
// php/db.php
// SQLite connection helper for this project

// Path to the SQLite database file
$dbPath = __DIR__ . '/../database/dreds.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}

// Example usage:
// $stmt = $pdo->query('SELECT * FROM users');
// $users = $stmt->fetchAll();

return $pdo;
