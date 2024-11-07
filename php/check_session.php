<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "logged_in"]);
} else {
    echo json_encode(["status" => "logged_out"]);
}
?>