<?php
session_start();

// Set the response header to JSON
header('Content-Type: application/json');

// Debugging: Log the POST data and session variables
error_log("POST Data: " . print_r($_POST, true));
error_log("Session Data: " . print_r($_SESSION, true));

// Get user type from session (assume 'student' if not set)
$user_type = strtolower($_SESSION['user_type'] ?? 'student');

// Get the ride status from POST or session (assume 'scheduled' if not provided)
$status = strtolower($_POST['status'] ?? $_SESSION['status'] ?? 'scheduled');

// Debugging: Log the received user type and status
error_log("User Type: " . $user_type);
error_log("Ride Status: " . $status);

// Set the base amount based on user type and ride status
$amount = 0;

if ($status === 'scheduled') {
    error_log("Scheduled ride status detected.");
    if ($user_type === 'faculty/staff') {
        $amount = 20; 
    } else {
        $amount = 18; 
    }
} elseif ($status === 'loading') {
    error_log("Loading ride status detected.");
    if ($user_type === 'faculty/staff') {
        $amount = 15; 
    } else {
        $amount = 13; 
    }
} else {
    // Handle unexpected ride status if needed
    echo json_encode(["status" => "error", "message" => "Unexpected ride status value: " . $status]);
    error_log("Error: Unexpected ride status value: " . $status);
    exit();
}

// Debugging: Log calculated amount to ensure correctness
error_log("Calculated Amount for User Type '$user_type' and Status '$status': " . $amount);

// Return the amount in JSON format
$response = [
    'status' => 'success',
    'amount' => $amount,
    'debug' => [
        'user_type' => $user_type,
        'status' => $status
    ]
];

echo json_encode($response);

?>
