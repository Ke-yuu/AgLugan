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

// Set error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Get the ride ID and status from the request
$data = json_decode(file_get_contents('php://input'), true);
$ride_id = isset($data['ride_id']) ? (int)$data['ride_id'] : 0;
$status = isset($data['status']) ? strtolower(trim($data['status'])) : '';

if ($ride_id > 0 && !empty($status)) {
    // Ensure status is a valid value
    $valid_statuses = ['scheduled', 'loading', 'inactive'];
    if (in_array($status, $valid_statuses)) {
        // Update the ride status in the database
        $sql = "UPDATE rides SET status = ? WHERE ride_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $status, $ride_id);

        error_log("Executing SQL: $sql with status: $status and ride_id: $ride_id");

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "message" => "No rows updated. Possibly invalid ride ID."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Invalid status value"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}

// Close the connection
$conn->close();
?>
