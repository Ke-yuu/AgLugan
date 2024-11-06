<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the route, status, and time from the request
$route = isset($_GET['route']) ? $_GET['route'] : '';
$status = isset($_GET['status']) ? $_GET['status'] : '';
$time = isset($_GET['time']) ? $_GET['time'] : '';

// Build the SQL query based on selected route, status, and time
$sql = "SELECT * FROM rides WHERE 1=1";

if (!empty($route)) {
    if ($route === "SLU-to-Church") {
        $sql .= " AND start_location = 'SLU' AND end_location = 'Church'";
    } else if ($route === "SLU-to-Town") {
        $sql .= " AND start_location = 'SLU' AND end_location = 'Town'";
    } else if ($route === "Town-to-SLU") {
        $sql .= " AND start_location = 'Town' AND end_location = 'SLU'";
    } else if ($route === "Town-to-Church") {
        $sql .= " AND start_location = 'Town' AND end_location = 'Church'";
    }
}

if (!empty($status)) {
    $sql .= " AND status = '$status'";
}

if (!empty($time)) {
    $sql .= " AND HOUR(departure_time) = HOUR('$time:00:00')";
}

// Execute the query
$result = $conn->query($sql);

// Prepare the response
$rides = array();
if ($result->num_rows > 0) {
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        $rides[] = $row;
    }
    echo json_encode($rides);
} else {
    echo json_encode(array("error" => "No rides available"));
}

// Close the connection
$conn->close();
?>
