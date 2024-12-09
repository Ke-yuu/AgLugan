<?php
// Display errors for debugging (should be disabled in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set response type to JSON
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Log error to server logs and send a JSON response to the client
    error_log("Connection failed: " . $conn->connect_error);
    echo json_encode(["error" => "Connection failed. Please try again later."]);
    exit();
}

// Get the route, status, time, and show_inactive from the request
$route = isset($_GET['route']) ? $_GET['route'] : '';
$status = isset($_GET['status']) ? $_GET['status'] : '';
$time = isset($_GET['time']) ? $_GET['time'] : '';
$show_inactive = isset($_GET['show_inactive']) ? $_GET['show_inactive'] : 'false';

// Build the SQL query based on selected route, status, and time
$sql = "SELECT rides.*, vehicles.plate_number 
        FROM rides 
        LEFT JOIN vehicles ON rides.driver_id = vehicles.driver_id 
        WHERE 1=1";

// Apply route filter if provided
if (!empty($route)) {
    $routeParts = explode('-', $route);
    if (count($routeParts) === 2) {
        $startLocation = trim($routeParts[0]);
        $endLocation = trim($routeParts[1]);
        $sql .= " AND start_location = '" . $conn->real_escape_string($startLocation) . "' AND end_location = '" . $conn->real_escape_string($endLocation) . "'";
    }
}

// Apply status filter if provided
if (!empty($status)) {
    $sql .= " AND LOWER(status) = '" . $conn->real_escape_string(strtolower($status)) . "'";
}

// Apply time filter if provided
if (!empty($time)) {
    $sql .= " AND time_range LIKE '%" . $conn->real_escape_string($time) . "%'";
}

// Apply filter for inactive rides if `show_inactive` is not set to true
if ($show_inactive !== 'true') {
    $sql .= " AND LOWER(status) != 'inactive'";
}

// Execute the query
$result = $conn->query($sql);

// Prepare the response
$rides = array();
if ($result) {
    if ($result->num_rows > 0) {
        // Output data of each row
        while ($row = $result->fetch_assoc()) {
            $rides[] = $row;
        }
        echo json_encode($rides);
    } else {
        // No rides found, return an empty array
        echo json_encode([]);
    }
} else {
    // Log the database error to the server logs
    error_log("Database query failed: " . $conn->error);
    echo json_encode(["error" => "Database query failed. Please try again later."]);
}

// Close the connection
$conn->close();
?>
