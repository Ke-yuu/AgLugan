<?php
//profile.php
header("Content-Type: application/json");

// Connect to the database
$servername = "127.0.0.1";
$username = "root"; 
$password = "";
$dbname = "aglugan";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Get the input data
$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'];
$email = $data['email'];

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User is not logged in.']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Update the user's profile
$sql = "UPDATE users SET name = ?, email = ? WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssi", $name, $email, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating profile: ' . $conn->error]);
}

// Close the connection
$stmt->close();
$conn->close();
?>
