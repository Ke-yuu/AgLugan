<?php
// Start session
session_start();

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $password = $_POST['password'];

    // Sanitize inputs to prevent SQL Injection
    $name = mysqli_real_escape_string($conn, $name);
    $password = mysqli_real_escape_string($conn, $password);

    // Query to check if the user exists and password matches
    $sql = "SELECT * FROM users WHERE name = '$name' AND password_hash = '$password'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Fetch the user details
        $user = $result->fetch_assoc();

        // Store relevant user information in the session
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['user_type'] = $user['user_type'];

        // Redirect based on user type
        if ($user['user_type'] == 'admin') {
            header("Location: ../html/admin-dashboard.html");
        } else if ($user['user_type'] == 'passenger') {
            header("Location: ../html/passenger-dashboard.html");
        } else if ($user['user_type'] == 'driver') {
            header("Location: ../html/driver-dashboard.html");
        }
        exit();
    } else {
        // Invalid credentials, display an error message
        echo "<script>alert('Invalid Name or Password'); window.location.href='../html/login.php';</script>";
    }
}

// Close the connection
$conn->close();
?>
