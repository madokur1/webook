<?php
/**
 * REGISTRATION HANDLER
 * 
 * Location: /api/auth/register.php
 * Purpose: Processes customer registration form
 * 
 * Handles:
 * - Form validation
 * - Password hashing
 * - Duplicate email checking
 * - Database insertion
 * - Error messages
 */

header('Content-Type: application/json');

// Import database connection
require_once '../../config/db.php';

// Initialize response array
$response = ['success' => false, 'message' => ''];

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Get form data
    $full_name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    // ===== VALIDATION =====
    
    // Check if all fields are filled
    if (empty($full_name) || empty($email) || empty($password) || empty($confirm_password)) {
        $response['message'] = 'All fields are required.';
        echo json_encode($response);
        exit;
    }
    
    // Check if email is valid
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please enter a valid email address.';
        echo json_encode($response);
        exit;
    }
    
    // Check if passwords match
    if ($password !== $confirm_password) {
        $response['message'] = 'Passwords do not match.';
        echo json_encode($response);
        exit;
    }
    
    // Check password length
    if (strlen($password) < 6) {
        $response['message'] = 'Password must be at least 6 characters long.';
        echo json_encode($response);
        exit;
    }
    
    // Check if full name is at least 3 characters
    if (strlen($full_name) < 3) {
        $response['message'] = 'Full name must be at least 3 characters long.';
        echo json_encode($response);
        exit;
    }
    
    // ===== DATABASE OPERATIONS =====
    
    // Check if email already exists (using prepared statement to prevent SQL injection)
    $check_email_query = "SELECT id FROM users WHERE email = ?";
    $check_stmt = $conn->prepare($check_email_query);
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        $response['message'] = 'Email already registered. Please use login or try another email.';
        echo json_encode($response);
        exit;
    }
    
    $check_stmt->close();
    
    // Hash the password using bcrypt (more secure than md5 or sha1)
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert new user into database (using prepared statement)
    $insert_query = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_query);
    
    if (!$insert_stmt) {
        $response['message'] = 'Database error: ' . $conn->error;
        echo json_encode($response);
        exit;
    }
    
    $insert_stmt->bind_param("sss", $full_name, $email, $hashed_password);
    
    if ($insert_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Registration successful! Redirecting to login...';
    } else {
        $response['message'] = 'Registration failed: ' . $insert_stmt->error;
    }
    
    $insert_stmt->close();
    
} else {
    $response['message'] = 'Invalid request method.';
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>
