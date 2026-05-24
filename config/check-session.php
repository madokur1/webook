<?php
/**
 * SESSION CHECK FILE
 * 
 * Location: /config/check-session.php
 * Purpose: Verifies if user is logged in
 * 
 * Usage:
 * Include this at the top of any page that requires login:
 * require_once 'config/check-session.php';
 * 
 * This will redirect to login page if user is not authenticated.
 */

session_start();

// Check if user session exists
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_email'])) {
    // User is not logged in - redirect to login page
    header('Location: login.html');
    exit;
}

// Optional: Check session timeout (30 minutes of inactivity)
$timeout_duration = 30 * 60; // 30 minutes in seconds

if (isset($_SESSION['login_time'])) {
    $elapsed_time = time() - $_SESSION['login_time'];
    
    if ($elapsed_time > $timeout_duration) {
        // Session expired
        session_destroy();
        header('Location: login.html?expired=1');
        exit;
    }
    
    // Update login time on each page load
    $_SESSION['login_time'] = time();
}
?>
