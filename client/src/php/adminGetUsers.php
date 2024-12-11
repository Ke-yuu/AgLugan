<?php
// Database connection details
$servername = "127.0.0.1"; // Or "localhost"
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "aglugan"; // Your database name

// Create database connection
$connection = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$connection) {
    die(json_encode(['error' => 'Connection failed: ' . mysqli_connect_error()]));
}

// Fetch users from the database
$query = "SELECT * FROM users"; // Modify this query if needed
$result = mysqli_query($connection, $query);

// Check if the query was successful
if (!$result) {
    die(json_encode(['error' => 'Query failed: ' . mysqli_error($connection)]));
}

$users = [];
// Fetch and store data in an array
while ($row = mysqli_fetch_assoc($result)) {
    $users[] = $row;
}

// Return the data as JSON
echo json_encode($users);

// Close the connection
mysqli_close($connection);
?>
