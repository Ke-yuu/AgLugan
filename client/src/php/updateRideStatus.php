<?php
// Display errors for debugging (disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set response type to JSON
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    echo json_encode(["success" => false, "message" => "Connection failed. Please try again later."]);
    exit();
}

// Get the ride ID and status from the request
$data = json_decode(file_get_contents('php://input'), true);
$ride_id = isset($data['ride_id']) ? (int)$data['ride_id'] : 0;
$status = isset($data['status']) ? strtolower(trim($data['status'])) : '';

// Log received values for debugging
error_log("Received ride_id: $ride_id, status: $status");

// Check if ride ID and status are valid
if ($ride_id > 0 && !empty($status)) {
    // Ensure status is a valid value
    $valid_statuses = ['scheduled', 'loading', 'inactive'];
    if (in_array($status, $valid_statuses)) {
        // Check if the ride_id exists in the database
        $check_query = "SELECT status FROM rides WHERE ride_id = ?";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bind_param("i", $ride_id);
        $check_stmt->execute();
        $result = $check_stmt->get_result();

        if ($result->num_rows > 0) {
            // Ride exists, proceed with the update
            $row = $result->fetch_assoc();
            if ($row['status'] === $status) {
                // Status is the same, nothing to update
                echo json_encode(["success" => true, "message" => "Status is already up-to-date. No changes made."]);
                exit();
            }

            $sql = "UPDATE rides SET status = ? WHERE ride_id = ?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                error_log("Error preparing SQL statement: " . $conn->error);
                echo json_encode(["success" => false, "message" => "Error preparing SQL statement"]);
                $conn->close();
                exit();
            }

            $stmt->bind_param("si", $status, $ride_id);

            // Log the SQL query for debugging
            error_log("Executing SQL: $sql with status: $status and ride_id: $ride_id");

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(["success" => true, "message" => "Ride status updated successfully."]);
                } else {
                    echo json_encode(["success" => false, "message" => "No rows updated. Possibly invalid ride ID or no changes detected."]);
                }
            } else {
                error_log("SQL Execution Error: " . $stmt->error);
                echo json_encode(["success" => false, "message" => $stmt->error]);
            }

            $stmt->close();
        } else {
            // Ride ID does not exist in the database
            error_log("Invalid ride ID: Ride not found - ride_id: $ride_id");
            echo json_encode(["success" => false, "message" => "Invalid ride ID: Ride not found"]);
        }
    } else {
        error_log("Invalid status value provided: $status");
        echo json_encode(["success" => false, "message" => "Invalid status value"]);
    }
} else {
    error_log("Invalid input: ride_id or status missing");
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}

// Close the connection
$conn->close();
?>
