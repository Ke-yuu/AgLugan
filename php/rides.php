<?php
// Database connection
$servername = "localhost";  // Replace with your database server
$username = "root";         // Replace with your database username
$password = "";             // Replace with your database password
$dbname = "aglugan";        // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the route from the request
$route = $_GET['route'];

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
}

// Return the results as JSON
echo json_encode($rides);

// Close the connection
$conn->close();
?>
