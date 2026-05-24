<?php
/**
 * LOGIN HANDLER
 * 
 * Location: /api/auth/login.php
 * Purpose: Processes customer login form
 * 
 * Handles:
 * - Email and password validation
 * - Password verification using bcrypt
 * - Session creation
 * - User authentication
 * - Error messages
 */

header('Content-Type: application/json');

// Start session to track user login
session_start();

// Import database connection
require_once '../../config/db.php';

// Initialize response array
$response = ['success' => false, 'message' => ''];

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Get form data
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // ===== VALIDATION =====
    
    // Check if both fields are filled
    if (empty($email) || empty($password)) {
        $response['message'] = 'Email and password are required.';
        echo json_encode($response);
        exit;
    }
    
    // Check if email is valid format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please enter a valid email address.';
        echo json_encode($response);
        exit;
    }
    
    // ===== DATABASE LOOKUP =====
    
    // Find user by email (using prepared statement to prevent SQL injection)
    $query = "SELECT id, full_name, email, password FROM users WHERE email = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        $response['message'] = 'Database error: ' . $conn->error;
        echo json_encode($response);
        exit;
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if user exists
    if ($result->num_rows === 0) {
        $response['message'] = 'Invalid email or password.';
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    // Get user data
    $user = $result->fetch_assoc();
    $stmt->close();
    
    // ===== PASSWORD VERIFICATION =====
    
    // Verify password using bcrypt (uses password_verify function)
    if (!password_verify($password, $user['password'])) {
        $response['message'] = 'Invalid email or password.';
        echo json_encode($response);
        $conn->close();
        exit;
    }
    
    // ===== SESSION CREATION =====
    
    // Password is correct - create session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['full_name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['login_time'] = time();
    
    // Check "Remember me" checkbox
    if (isset($_POST['remember']) && $_POST['remember'] === 'on') {
        // Set cookie for 30 days (optional)
        setcookie('user_email', $email, time() + (30 * 24 * 60 * 60), '/');
    }
    
    $response['success'] = true;
    $response['message'] = 'Login successful! Redirecting...';
    $response['redirect'] = 'pages/booking.html'; // Redirect to booking page for customer
    $response['user'] = [
        'full_name' => $user['full_name'],
        'email' => $user['email']
    ];
    
} else {
    $response['message'] = 'Invalid request method.';
}

// Close database connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>
