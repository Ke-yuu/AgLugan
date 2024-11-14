<?php
session_start();

// Set the response header to JSON
header('Content-Type: application/json');

// Get user type from session (assume 'Student' if not set)
$user_type = strtolower($_SESSION['user_type'] ?? 'student');

// Get the ride status from POST or session (assume 'scheduled' if not provided)
$status = strtolower($_POST['status'] ?? $_SESSION['status'] ?? 'scheduled');

// Set the base amount based on user type and ride status
$amount = 0;

if ($status === 'scheduled') {
    if ($user_type === 'faculty/staff') {
        $amount = 20;
    } else {
        $amount = 18;
    }
} elseif ($status === 'loading') {
    if ($user_type === 'faculty/staff') {
        $amount = 15;
    } else {
        $amount = 13;
    }
} else {
    // Handle unexpected ride status if needed (for example, set default values)
    $amount = $user_type === 'faculty/staff' ? 15 : 13;
}

// Return the amount in JSON format
$response = [
    'status' => 'success',
    'amount' => $amount
];

echo json_encode($response);
?>
