// Update to PHP Script to fix the fetching rides problem
<?php
// Display errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(array("error" => "Connection failed: " . $conn->connect_error));
    exit();
}

// Set response type to JSON
header('Content-Type: application/json');

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
        echo json_encode(array("error" => "No rides available"));
    }
} else {
    echo json_encode(array("error" => "Database query failed: " . $conn->error));
}

// Close the connection
$conn->close();
?>
