<?php
// api/init.php
header('Content-Type: application/json');
require_once 'koneksi.php';

try {
    $tables = ['users', 'labs', 'alat', 'jadwal', 'peminjaman', 'detail_peminjaman', 'notifikasi'];
    $data = [];

    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table");
        $data[$table] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Handle boolean conversions
        if ($table === 'notifikasi') {
            foreach ($data[$table] as &$row) {
                $row['read'] = $row['is_read'] == 1;
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'data' => $data
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal mengambil data: ' . $e->getMessage()
    ]);
}
?>
