<?php
header('Content-Type: application/json');

// Ensure the uploads directory exists
$uploadDir = '../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['foto'])) {
    $file = $_FILES['foto'];
    
    // Check for errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'Upload error code: ' . $file['error']]);
        exit;
    }
    
    // Validate file type (basic)
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['status' => 'error', 'message' => 'Hanya file gambar yang diizinkan (JPG, PNG, GIF, WEBP)']);
        exit;
    }
    
    // Generate a unique file name to avoid overwriting
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('alat_') . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        echo json_encode(['status' => 'success', 'url' => 'uploads/' . $filename]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan file']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Tidak ada file yang diunggah']);
}
?>
