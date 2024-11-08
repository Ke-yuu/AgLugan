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

// Get the ride ID and status from the request
$data = json_decode(file_get_contents('php://input'), true);
$ride_id = isset($data['ride_id']) ? $data['ride_id'] : '';
$status = isset($data['status']) ? $data['status'] : '';

if (!empty($ride_id) && !empty($status)) {
    // Update the ride status in the database
    $sql = "UPDATE rides SET status = ? WHERE ride_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $status, $ride_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}

// Close the connection
$conn->close();
?>
