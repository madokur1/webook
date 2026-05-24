<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

// Ensure password_resets table exists
$createSql = "CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(128) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (token)
)";
$conn->query($createSql);

$email = $_POST['email'] ?? '';
$email = trim($email);

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Email is required.']);
    exit;
}

// Find user
$stmt = $conn->prepare('SELECT id, full_name FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

// Always respond with success to avoid enumeration
if (!$user) {
    echo json_encode(['success' => true, 'message' => 'If that email exists, a reset link was sent.']);
    exit;
}

$user_id = $user['id'];

// Remove old tokens for this user
$del = $conn->prepare('DELETE FROM password_resets WHERE user_id = ?');
$del->bind_param('i', $user_id);
$del->execute();
$del->close();

// Create token (use DB time to avoid timezone mismatch)
$token = bin2hex(random_bytes(32));
$ins = $conn->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))');
$ins->bind_param('is', $user_id, $token);
$ins->execute();
$ins->close();

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$scriptPath = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
// remove any /api/* suffix to get site base
$base = preg_replace('#/api(/.*)?$#', '', $scriptPath);
$reset_link = sprintf('%s://%s%s/reset_password.php?token=%s', $scheme, $_SERVER['HTTP_HOST'], $base, $token);

// Try to send email (may not be configured on local XAMPP). If mail fails, return the link in the response for local testing.
$subject = 'Password reset for Dred\'s Transient';
$message = "Hello " . $user['full_name'] . ",\n\n" .
    "We received a request to reset your password. Click the link below to reset it (expires in 1 hour):\n\n" .
    $reset_link . "\n\nIf you didn't request a reset, ignore this message.\n";
$headers = "From: noreply@localhost" . "\r\n" . "Reply-To: noreply@localhost\r\n";

$mailSent = false;
@ob_start();
$mailSent = mail($email, $subject, $message, $headers);
@ob_end_clean();

$response = ['success' => true, 'message' => 'If that email exists, a reset link was sent.'];
if (!$mailSent) {
    // Provide link for local testing (developer fallback)
    $response['debug_reset_link'] = $reset_link;
}

echo json_encode($response);
exit;
