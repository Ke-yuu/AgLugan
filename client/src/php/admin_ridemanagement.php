<?php

$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create database connection
$connection = mysqli_connect($servername, $username, $password, $dbname);

if (!$connection) {
    die("Connection failed: " . mysqli_connect_error());
}

// Fetch rides from the database
$query = "SELECT * FROM rides";
$result = mysqli_query($connection, $query);

$rides = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rides[] = $row;
}

// Return data as JSON
echo json_encode($rides);

// Close connection
mysqli_close($connection);
?>
