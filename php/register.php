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
$sql = "SELECT *, time_range AS time_range FROM rides WHERE 1=1";

// Apply route filter if provided
if (!empty($route)) {
    switch ($route) {
        case "SLU-to-Church":
            $sql .= " AND start_location = 'SLU' AND end_location = 'CHURCH'";
            break;
        case "SLU-to-Town":
            $sql .= " AND start_location = 'SLU' AND end_location = 'TOWN'";
            break;
        case "Town-to-SLU":
            $sql .= " AND start_location = 'TOWN' AND end_location = 'SLU'";
            break;
        case "Town-to-Church":
            $sql .= " AND start_location = 'TOWN' AND end_location = 'CHURCH'";
            break;
    }
}

// Apply status filter if provided
if (!empty($status)) {
    $sql .= " AND status = '$status'";
}

// Apply time filter if provided
if (!empty($time)) {
    $sql .= " AND time_range LIKE '%$time%'";
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
