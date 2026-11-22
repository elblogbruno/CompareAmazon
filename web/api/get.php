<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once dirname(__DIR__, 2) . '/private/config.php';

$id = trim((string)($_GET['id'] ?? ''));
if (!preg_match('/^[A-Za-z0-9_-]{4,16}$/', $id)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'ID inválido']);
    exit;
}

try {
    $pdo = getDb();
    $stmt = $pdo->prepare('SELECT id, title, products_count, payload, theme, views, created_at FROM comparisons WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Comparativa no encontrada']);
        exit;
    }

    echo json_encode([
        'ok' => true,
        'id' => $row['id'],
        'title' => $row['title'],
        'theme' => $row['theme'],
        'views' => (int)$row['views'],
        'createdAt' => $row['created_at'],
        'data' => json_decode($row['payload'], true),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error de servidor']);
}
