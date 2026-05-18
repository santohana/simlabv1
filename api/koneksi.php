<?php
// api/koneksi.php

$host = 'localhost';
$dbname = 'simlab_ipa';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Set error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode([
        'status' => 'error',
        'message' => 'Koneksi database gagal: ' . $e->getMessage()
    ]));
}

// Function to generate unique ID similar to JS Date.now().toString(36)
function generateId($prefix = '') {
    return $prefix . uniqid();
}
?>
