<?php
session_start();

// Suppress error display to avoid sending them as part of the JSON response
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Log errors to a file
ini_set('log_errors', 1);
ini_set('error_log', 'forgot_password_errors.log');

// Set the response header to JSON
header('Content-Type: application/json');

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
$email = $input['email'] ?? '';

if (!$email) {
    echo json_encode(["status" => "error", "message" => "Email is required."]);
    exit();
}

// Check if the email exists in the database
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User exists, generate reset token
    $user = $result->fetch_assoc();
    $userId = $user['user_id'];
    $token = bin2hex(random_bytes(50));
    $expires = date("Y-m-d H:i:s", strtotime('+1 hour')); 

    // Store the token in the database
    $stmt = $conn->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)");
    $stmt->bind_param("iss", $userId, $token, $expires);
}
if ($stmt->execute()) {
        // Send reset email
    $resetLink = "http://yourwebsite.com/reset_password.html?token=" . urlencode($token);
    $subject = "Password Reset Request";
    $message = "To reset your password, click the link below:\n\n" . $resetLink;
    $headers = "From: no-reply@yourwebsite.com";
    
    if (mail($email, $subject, $message, $headers)) {
            echo json_encode(["status" => "success", "message" => "Password reset link has been sent to your email."]);
    } else {
            echo json_encode(["status" => "error", "message" => "Failed to send email. Please try again."]);
    }
} else {
        echo json_encode(["status" => "error", "message" => "Failed to generate reset token."]);
}
    
// Store the token in the database
$stmt = $conn->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)");
$stmt->bind_param("iss", $userId, $token, $expires);
if ($stmt->execute()) {
    // Send reset email
    $resetLink = "http://yourwebsite.com/reset_password.html?token=" . urlencode($token);
    $subject = "Password Reset Request";
    $message = "To reset your password, click the link below:\n\n" . $resetLink;
    $headers = "From: no-reply@aglugancs.com";

    if (mail($email, $subject, $message, $headers)) {
        echo json_encode(["status" => "success", "message" => "Password reset link has been sent to your email."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to send email. Please try again."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Failed to generate reset token."]);
}

$conn->close();
?>
