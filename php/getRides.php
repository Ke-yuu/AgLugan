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

// Get the route from the request
$route = isset($_GET['route']) ? $_GET['route'] : '';

// Define the SQL query based on the selected route
if ($route === "bakakeng-to-city") {
    $sql = "SELECT * FROM rides WHERE start_location = 'Bakakeng' AND end_location = 'Town' AND status = 'on-route'";
} else if ($route === "city-to-bakakeng") {
    $sql = "SELECT * FROM rides WHERE start_location = 'Town' AND end_location = 'Bakakeng' AND status = 'on-route'";
} else {
    echo json_encode(array("error" => "Invalid route"));
    exit();
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
