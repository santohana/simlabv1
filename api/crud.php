<?php
// api/crud.php
header('Content-Type: application/json');
require_once 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$table = $_GET['table'] ?? '';

if (!$table) {
    echo json_encode(['status' => 'error', 'message' => 'Table not specified']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'POST':
            // CREATE
            $id = generateId(substr($table, 0, 1));
            $input['id'] = $input['id'] ?? $id; // Keep client ID if provided, else generate
            
            // Special handling for notifikasi read status
            if ($table === 'notifikasi' && isset($input['read'])) {
                $input['is_read'] = $input['read'] ? 1 : 0;
                unset($input['read']);
            }
            
            $columns = implode(', ', array_keys($input));
            $placeholders = implode(', ', array_fill(0, count($input), '?'));
            $values = array_values($input);

            $stmt = $pdo->prepare("INSERT INTO $table ($columns) VALUES ($placeholders)");
            $stmt->execute($values);
            
            // Re-apply format for return
            if ($table === 'notifikasi' && isset($input['is_read'])) {
                $input['read'] = $input['is_read'] == 1;
                unset($input['is_read']);
            }
            
            echo json_encode(['status' => 'success', 'data' => $input]);
            break;

        case 'PUT':
            // UPDATE
            $id = $_GET['id'] ?? '';
            if (!$id) {
                echo json_encode(['status' => 'error', 'message' => 'ID not specified']);
                exit;
            }

            if ($table === 'notifikasi' && isset($input['read'])) {
                $input['is_read'] = $input['read'] ? 1 : 0;
                unset($input['read']);
            }

            $setClause = [];
            $values = [];
            foreach ($input as $key => $value) {
                if ($key !== 'id') {
                    $setClause[] = "$key = ?";
                    $values[] = $value;
                }
            }
            $setClauseStr = implode(', ', $setClause);
            $values[] = $id;

            $stmt = $pdo->prepare("UPDATE $table SET $setClauseStr WHERE id = ?");
            $stmt->execute($values);

            // Fetch the updated row to return
            $stmtSelect = $pdo->prepare("SELECT * FROM $table WHERE id = ?");
            $stmtSelect->execute([$id]);
            $updatedRow = $stmtSelect->fetch(PDO::FETCH_ASSOC);

            if ($table === 'notifikasi' && $updatedRow) {
                $updatedRow['read'] = $updatedRow['is_read'] == 1;
            }

            echo json_encode(['status' => 'success', 'data' => $updatedRow]);
            break;

        case 'DELETE':
            // DELETE
            $id = $_GET['id'] ?? '';
            if (!$id) {
                echo json_encode(['status' => 'error', 'message' => 'ID not specified']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['status' => 'success']);
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
