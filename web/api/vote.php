<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once dirname(__DIR__, 2) . '/private/config.php';

function fetchVotesForComparison(PDO $pdo, string $compId): array {
    $stmt = $pdo->prepare(
        'SELECT id, product_key, voter_name, comment, created_at FROM comparison_votes WHERE comparison_id = ? ORDER BY created_at DESC LIMIT 200'
    );
    $stmt->execute([$compId]);
    $grouped = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $k = $row['product_key'];
        if (!isset($grouped[$k])) {
            $grouped[$k] = ['count' => 0, 'items' => []];
        }
        $grouped[$k]['count']++;
        $grouped[$k]['items'][] = [
            'voter' => $row['voter_name'],
            'comment' => $row['comment'],
            'createdAt' => $row['created_at'],
        ];
    }
    return $grouped;
}

try {
    $pdo = getDb();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $compId = trim((string)($_GET['id'] ?? ''));
        if (!preg_match('/^[A-Za-z0-9_-]{4,16}$/', $compId)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'ID inválido']);
            exit;
        }
        echo json_encode(['ok' => true, 'votes' => fetchVotesForComparison($pdo, $compId)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode((string)file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
            exit;
        }

        $compId = trim((string)($input['comparisonId'] ?? ''));
        $productKey = mb_substr(trim((string)($input['productKey'] ?? '')), 0, 64);
        $voterName = mb_substr(trim((string)($input['voterName'] ?? '')), 0, 60);
        $comment = mb_substr(trim((string)($input['comment'] ?? '')), 0, 280);

        if (!preg_match('/^[A-Za-z0-9_-]{4,16}$/', $compId) || $productKey === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Faltan parámetros válidos']);
            exit;
        }

        // Verify comparison exists
        $chk = $pdo->prepare('SELECT 1 FROM comparisons WHERE id = ? LIMIT 1');
        $chk->execute([$compId]);
        if (!$chk->fetchColumn()) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Comparativa no encontrada']);
            exit;
        }

        if ($voterName === '') {
            $voterName = 'Anónimo';
        }

        $ins = $pdo->prepare(
            'INSERT INTO comparison_votes (comparison_id, product_key, voter_name, comment) VALUES (?, ?, ?, ?)'
        );
        $ins->execute([$compId, $productKey, $voterName, $comment]);

        echo json_encode([
            'ok' => true,
            'votes' => fetchVotesForComparison($pdo, $compId),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error guardando el voto']);
}
