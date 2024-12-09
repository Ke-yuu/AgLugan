<?php
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit();
}

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Internal server error."]);
    error_log("Connection failed: " . $conn->connect_error);
    exit();
}

// Get the user ID from the session and the ride ID from the request
$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);
$ride_id = $data['ride_id'];

// Update the ride status to "Booked" and link it to the user
$book_ride_sql = "UPDATE rides SET user_id = ?, booking_status = 'Booked' WHERE ride_id = ? AND booking_status = 'Available'";
$stmt = $conn->prepare($book_ride_sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Internal server error."]);
    error_log("Prepare statement failed: " . $conn->error);
    exit();
}

$stmt->bind_param("ii", $user_id, $ride_id);
if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to book ride. Please try again later."]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
