<?php
// Start session
session_start();

// Set the response header to JSON
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
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $password = $_POST['password'];

    // Prepare the SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT * FROM users WHERE name = ?");
    $stmt->bind_param("s", $name);

    // Execute the statement
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Fetch the user details
        $user = $result->fetch_assoc();

        // Verify the hashed password
        if (password_verify($password, $user['password_hash'])) {
            // Password matches, store relevant user information in the session
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['user_type'] = $user['user_type'];

            // Redirect based on user type and send it back in the JSON response
            $redirectUrl = '';
            if ($user['user_type'] == 'admin') {
                $redirectUrl = '../html/admin-dashboard.html';
            } else if ($user['user_type'] == 'passenger') {
                $redirectUrl = '../html/passenger-dashboard.html';
            } else if ($user['user_type'] == 'driver') {
                $redirectUrl = '../html/driver-dashboard.html';
            }

            echo json_encode([
                "status" => "success",
                "redirectUrl" => $redirectUrl
            ]);
        } else {
            // Invalid password
            echo json_encode(["status" => "error", "message" => "Invalid name or password."]);
        }
    } else {
        // Invalid username
        echo json_encode(["status" => "error", "message" => "Invalid name or password."]);
    }

    // Close the prepared statement
    $stmt->close();
}

// Close the connection
$conn->close();
?>
