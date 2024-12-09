<?php
header("Content-Type: application/json");
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User is not logged in.']);
    exit();
}

// Database credentials
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create a new database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check database connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Retrieve POST data
$data = json_decode(file_get_contents('php://input'), true);
$current_password = $data['current_password'] ?? null;
$new_password = $data['new_password'] ?? null;

// Validate input data
if (empty($current_password) || empty($new_password)) {
    echo json_encode(['success' => false, 'message' => 'Both current password and new password are required.']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch current password hash from the database
$sql = "SELECT password_hash FROM users WHERE user_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error preparing statement: ' . $conn->error]);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($password_hash);
$stmt->fetch();
$stmt->close();

if (!$password_hash) {
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    exit();
}

// Verify current password
if (!password_verify($current_password, $password_hash)) {
    echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
    exit();
}

// Check if new password is different from the current password
if (password_verify($new_password, $password_hash)) {
    echo json_encode(['success' => false, 'message' => 'New password must be different from the current password.']);
    exit();
}

// Hash the new password
$new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

// Update the password in the database
$sql = "UPDATE users SET password_hash = ? WHERE user_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error preparing update statement: ' . $conn->error]);
    exit();
}

$stmt->bind_param("si", $new_password_hash, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating password: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
