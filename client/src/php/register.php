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

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the form data from the request
    $name = $_POST['name'];
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $phone_number = $_POST['phone_number'];
    // Default value is 'Student' if no user type is provided
    $user_type = $_POST['user_type'] ?? 'Student';

    // Validate user type
    $valid_user_types = ['Student', 'Faculty/Staff', 'Driver'];
    if (!in_array($user_type, $valid_user_types)) {
        $user_type = 'Student'; 
    }

    // Insert the new user into the database
    $insert_stmt = $conn->prepare("INSERT INTO users (name, username, email, password_hash, phone_number, user_type) VALUES (?, ?, ?, ?, ?, ?)");
    if ($insert_stmt === false) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error preparing insert statement"]);
        exit();
    }

    $insert_stmt->bind_param("ssssss", $name, $username, $email, $password, $phone_number, $user_type);

    if ($insert_stmt->execute()) {
        // Successful registration
        echo json_encode(["status" => "success", "message" => "Registration successful"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error registering user"]);
    }

    $insert_stmt->close();
}

// Close the connection
$conn->close();
?>