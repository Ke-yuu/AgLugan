<?php
session_start();

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Create connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';
$newPassword = $input['newPassword'] ?? '';

if (!$token || !$newPassword) {
    echo json_encode(["status" => "error", "message" => "Invalid input."]);
    exit();
}

// Verify the token
$stmt = $conn->prepare("SELECT user_id, expires_at FROM password_resets WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $resetData = $result->fetch_assoc();
    if (strtotime($resetData['expires_at']) < time()) {
        echo json_encode(["status" => "error", "message" => "The token has expired."]);
        exit();
    }

    // Update the user's password
    $userId = $resetData['user_id'];
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
    $stmt->bind_param("si", $hashedPassword, $userId);

    if ($stmt->execute()) {
        // Delete the token after a successful password reset
        $stmt = $conn->prepare("DELETE FROM password_resets WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();

        echo json_encode(["status" => "success", "message" => "Password has been reset successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to reset password."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid or expired token."]);
}

$conn->close();
?>
