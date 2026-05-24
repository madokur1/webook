<?php
/**
 * LOGOUT HANDLER
 * 
 * Location: /api/auth/logout.php
 * Purpose: Destroys user session and logs them out
 * 
 * Actions:
 * - Destroys session data
 * - Clears cookies
 * - Redirects to login page
 */

// Start session
session_start();

// Clear all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Clear any persistent cookies
setcookie('user_email', '', time() - 3600, '/');

// Redirect to login page
header('Location: ../../login.html');
exit;
?>
