<?php
// process_payment.php
header('Content-Type: application/json');

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

// Get payment details from form submission
$payment_method = $_POST['payment_method'];
$amount = $_POST['amount'];
$name = $_POST['name'];
$phone_number = $_POST['gcash-number'] ?? $_POST['maya-number']; 

// Insert payment into 'payments' table
$sql = "INSERT INTO payments (ride_id, amount, payment_method, phone_number, status) VALUES (NULL, ?, ?, ?, 'pending')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("dss", $amount, $payment_method, $phone_number); 

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Payment submitted successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
}

// Close connection
$conn->close();
?>
