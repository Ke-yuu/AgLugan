<?php
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

// Create a connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Parse the input data
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid input"]);
        exit();
    }

    // Get the email and phone number from the input data
    $email = $data['email'] ?? '';
    $phone_number = $data['phone_number'] ?? '';

    // Prepare SQL to check if the email or phone number already exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR phone_number = ?");
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error preparing statement"]);
        exit();
    }

    $stmt->bind_param("ss", $email, $phone_number);
    $stmt->execute();
    $result = $stmt->get_result();

    $email_exists = false;
    $phone_exists = false;

    while ($row = $result->fetch_assoc()) {
        if ($row['email'] === $email) {
            $email_exists = true;
        }
        if ($row['phone_number'] === $phone_number) {
            $phone_exists = true;
        }
    }

    echo json_encode([
        "email_exists" => $email_exists,
        "phone_exists" => $phone_exists
    ]);

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>
