<?php
session_start();

// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-Type: application/json');

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Return a JSON response indicating successful logout
echo json_encode(["status" => "success", "message" => "Logged out successfully."]);
exit();
?>
