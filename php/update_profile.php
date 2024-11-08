<?php
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User is not logged in.']);
    exit();
}

$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "aglugan";

// Enable error reporting for troubleshooting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';

if (empty($name) && empty($email)) {
    echo json_encode(['success' => false, 'message' => 'No data to update.']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Prepare the SQL query dynamically
$updates = [];
$params = [];
$types = "";

if (!empty($name)) {
    $updates[] = "name = ?";
    $params[] = $name;
    $types .= "s";
}

if (!empty($email)) {
    // Validate email domain
    $allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'slu.edu.ph'];
    $emailDomain = substr(strrchr($email, "@"), 1);
    if (!in_array($emailDomain, $allowedDomains)) {
        echo json_encode(['success' => false, 'message' => 'Only gmail.com, hotmail.com, yahoo.com, and slu.edu.ph domains are allowed.']);
        exit();
    }

    // Check if the email is already taken by another user
    $sql = "SELECT * FROM users WHERE email = ? AND user_id != ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $email, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'The email address is already in use by another account.']);
        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->close();

    $updates[] = "email = ?";
    $params[] = $email;
    $types .= "s";
}

$params[] = $user_id;
$types .= "i";

// Update user profile
$sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating profile: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
