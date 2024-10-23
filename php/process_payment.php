<?php
// Start the session to access user information
session_start();

header('Content-Type: application/json');

// Enable error logging for debugging (write errors to a log file)
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt'); // Adjust the path if needed
error_reporting(E_ALL); // Enable all error reporting

// Disable displaying errors in production
ini_set('display_errors', 0);

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Check if the user is logged in and retrieve the user_id from the session
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in."]);
    exit();
}

$user_id = $_SESSION['user_id'];  // Fetch user_id from session

// Get payment details from form submission
$payment_method = isset($_POST['payment_method']) ? $_POST['payment_method'] : '';
$amount = isset($_POST['amount']) ? $_POST['amount'] : 0;
$name = isset($_POST['name']) ? $_POST['name'] : '';
$ride_id = isset($_POST['ride_id']) ? $_POST['ride_id'] : '';

// Handle payment method to get the phone number based on GCash or Maya
$phone_number = null;
if ($payment_method === "gcash") {
    $phone_number = isset($_POST['gcash-number']) ? $_POST['gcash-number'] : '';
} elseif ($payment_method === "maya") {
    $phone_number = isset($_POST['maya-number']) ? $_POST['maya-number'] : '';
}

// Validate required fields
if (empty($amount) || empty($phone_number) || empty($payment_method) || empty($user_id) || empty($ride_id)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit();
}

// Insert payment into 'payments' table with ride_id
$sql = "INSERT INTO payments (ride_id, amount, payment_method, phone_number, user_id, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("idssi", $ride_id, $amount, $payment_method, $phone_number, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Payment submitted successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
}

// Close connection
$stmt->close();
$conn->close();
?>
