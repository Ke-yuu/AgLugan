<?php
// Start session to access logged-in user information
session_start();

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

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in."]);
    exit();
}

// Get the user ID from the session
$user_id = $_SESSION['user_id'];

// Fetch the user's name and email from the `users` table
$user_sql = "SELECT name, email FROM users WHERE user_id = ?";
$stmt = $conn->prepare($user_sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user_result = $stmt->get_result();
$user_data = $user_result->fetch_assoc();

// Fetch available rides from the `rides` table
$rides_sql = "SELECT start_location, end_location, status, fare, waiting_time FROM rides WHERE status = 'waiting'";
$rides_result = $conn->query($rides_sql);
$rides = [];
while ($row = $rides_result->fetch_assoc()) {
    $rides[] = $row;
}

// Fetch payment history for the logged-in user
$payment_sql = "SELECT ride_id, amount, payment_method, status FROM payments WHERE user_id = ?";
$payment_stmt = $conn->prepare($payment_sql);
$payment_stmt->bind_param("i", $user_id);
$payment_stmt->execute();
$payment_result = $payment_stmt->get_result();
$payments = [];
while ($row = $payment_result->fetch_assoc()) {
    $payments[] = $row;
}

// Combine user, ride, and payment history data into a single response
$response = [
    "user" => $user_data,
    "rides" => $rides,
    "payments" => $payments // Payment history
];

// Return the data as JSON
echo json_encode($response);

// Close the connection
$conn->close();
?>
