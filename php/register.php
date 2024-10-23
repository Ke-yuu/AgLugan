<?php
// Start session
session_start();

// Enable error reporting for debugging (remove this in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Return JSON error response
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $phone_number = $_POST['phone_number'];
    $user_type = 'passenger';

    // Prepare SQL to check if the user already exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    if ($stmt === false) {
        // Return JSON error response
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error preparing statement"]);
        exit();
    }

    $stmt->bind_param("s", $email);

    // Execute the statement
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Email already exists
        http_response_code(409);  // Conflict
        echo json_encode(["status" => "error", "message" => "Email already registered"]);
    } else {
        // Insert the new user into the database
        $insert_stmt = $conn->prepare("INSERT INTO users (name, email, password_hash, phone_number, user_type) VALUES (?, ?, ?, ?, ?)");
        if ($insert_stmt === false) {
            http_response_code(500); 
            echo json_encode(["status" => "error", "message" => "Error preparing insert statement"]);
            exit();
        }

        $insert_stmt->bind_param("sssss", $name, $email, $password, $phone_number, $user_type);

        if ($insert_stmt->execute()) {
            // Successful registration
            echo json_encode(["status" => "success", "message" => "Registration successful"]);
        } else {
            http_response_code(500); 
            echo json_encode(["status" => "error", "message" => "Error registering user"]);
        }

        $insert_stmt->close();
    }

    // Close the prepared statement
    $stmt->close();
}

// Close the connection
$conn->close();
?>
