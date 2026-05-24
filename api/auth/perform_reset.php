<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$token = $_POST['token'] ?? '';
$password = $_POST['password'] ?? '';
$confirm = $_POST['confirm_password'] ?? '';

$token = trim($token);

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'Invalid or missing token.']);
    exit;
}

if (!$password || strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

if ($password !== $confirm) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

// Lookup token
$stmt = $conn->prepare('SELECT pr.id, pr.user_id FROM password_resets pr WHERE pr.token = ? AND pr.expires_at > NOW() LIMIT 1');
$stmt->bind_param('s', $token);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Token invalid or expired.']);
    exit;
}

$user_id = $row['user_id'];

// Update user password
$hash = password_hash($password, PASSWORD_DEFAULT);
$u = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
$u->bind_param('si', $hash, $user_id);
$u->execute();
$u->close();

// Remove all tokens for this user
$d = $conn->prepare('DELETE FROM password_resets WHERE user_id = ?');
$d->bind_param('i', $user_id);
$d->execute();
$d->close();

echo json_encode(['success' => true, 'message' => 'Password has been reset. You can now log in.']);
exit;
