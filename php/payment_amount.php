<?php
session_start();

// Set the response header to JSON
header('Content-Type: application/json');

// Dummy user type from session (in actual implementation, this should come from the session)
$user_type = $_SESSION['user_type'] ?? 'Student';
$status = isset($_POST['status']) ? strtolower($_POST['status']) : (isset($_SESSION['status']) ? strtolower($_SESSION['status']) : 'scheduled'); // Assuming ride status is stored in the session or passed as a parameter

// Set the base amount based on user type and ride status
if ($status === 'scheduled') {
    if ($user_type === 'faculty/staff') {
        $amount = 20; // Faculty/Staff booking a scheduled ride
    } else {
        $amount = 18; // Student booking a scheduled ride
    }
} elseif ($status === 'loading') {
    if ($user_type === 'faculty/staff') {
        $amount = 15; // Faculty/Staff booking a loading ride
    } else {
        $amount = 13; // Student booking a loading ride
    }
} else {
    $amount = $user_type === 'faculty/staff' ? 15 : 13; // Default amount for other ride statuses
}

// Return the amount in JSON format
$response = [
    'status' => 'success',
    'amount' => $amount
];

echo json_encode($response);
?>
