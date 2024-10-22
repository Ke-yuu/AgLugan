<?php
// Enable error reporting for debugging (remove this in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Check if required fields are set
    if (!isset($_POST['name'], $_POST['email'], $_POST['password'], $_POST['phone_number'], $_POST['user_type'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // Collect form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password_hash = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $phone_number = $_POST['phone_number'];
    $user_type = $_POST['user_type'];

    // Log values for debugging
    error_log("Name: " . $name);
    error_log("Email: " . $email);
    error_log("Password Hash: " . $password_hash);
    error_log("Phone Number: " . $phone_number);
    error_log("User Type: " . $user_type); // Log user type

    // Prepare and execute SQL query
    $sql = "INSERT INTO users (name, email, password_hash, phone_number, user_type) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        echo json_encode(["status" => "error", "message" => "Statement preparation failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("sssss", $name, $email, $password_hash, $phone_number, $user_type);

    // Log the prepared statement and parameters
    error_log("Prepared statement: " . $sql);
    error_log("Parameters: " . json_encode([$name, $email, $password_hash, $phone_number, $user_type]));

    // Execute the query
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Registration successful"]);
    } else {
        error_log("Execution error: " . $stmt->error); // Log execution error if it fails
        echo json_encode(["status" => "error", "message" => "Registration failed: " . $stmt->error]);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
?>
