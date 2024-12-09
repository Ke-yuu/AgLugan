<?php
session_start();

// Enable error reporting for debugging (remove this in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set the header to return JSON
header('Content-Type: application/json');

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// Get the form data from the request
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'];
$phone_number = $data['phone_number'];
$username = $data['username'];

// Prepare and execute query to check uniqueness of email, phone number, and username
$email_query = $conn->prepare("SELECT * FROM users WHERE email = ?");
$email_query->bind_param("s", $email);
$email_query->execute();
$email_exists = $email_query->get_result()->num_rows > 0;

$phone_query = $conn->prepare("SELECT * FROM users WHERE phone_number = ?");
$phone_query->bind_param("s", $phone_number);
$phone_query->execute();
$phone_exists = $phone_query->get_result()->num_rows > 0;

$username_query = $conn->prepare("SELECT * FROM users WHERE username = ?");
$username_query->bind_param("s", $username);
$username_query->execute();
$username_exists = $username_query->get_result()->num_rows > 0;

echo json_encode([
    "email_exists" => $email_exists,
    "phone_exists" => $phone_exists,
    "username_exists" => $username_exists
]);

$email_query->close();
$phone_query->close();
$username_query->close();
$conn->close();
?>
