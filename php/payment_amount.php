<?php
session_start();

// Set the response header to JSON
header('Content-Type: application/json');

// Dummy user type from session (in actual implementation, this should come from the session)
$user_type = $_SESSION['user_type'] ?? 'Student';

// Set the amount based on user type
$amount = $user_type === 'Faculty/Staff' ? 15 : 13;

// Return the amount in JSON format
$response = [
    'status' => 'success',
    'amount' => $amount
];

echo json_encode($response);
?>
