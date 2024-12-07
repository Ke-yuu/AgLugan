<?php
// Database connection
$host = '127.0.0.1';
$user = 'root'; // Replace with your database username
$pass = ''; // Replace with your database password
$dbname = 'aglugan';

$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    // Return a JSON error message if connection fails
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

// Fetch data from the passenger_statistics table
$sql = "SELECT day_of_week, time_slot, bookings_count 
        FROM passenger_statistics 
        ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), time_slot";

$result = $conn->query($sql);

// Check if query is successful
if ($result === false) {
    echo json_encode(['error' => 'Error executing query: ' . $conn->error]);
    exit();
}

$data = [];
if ($result->num_rows > 0) {
    // Fetch each row and add to the $data array
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
} else {
    // If no data is found, return an empty array
    $data = [];
}

// Return data as JSON
header('Content-Type: application/json');
echo json_encode($data);

// Close the connection
$conn->close();
?>
