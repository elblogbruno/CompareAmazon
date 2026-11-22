<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

require_once dirname(__DIR__, 2) . '/private/config.php';
require_once dirname(__DIR__, 2) . '/private/auth.php';

$authUser = currentUser();
if (!$authUser) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'authRequired' => true,
        'error' => 'Debes iniciar sesión en compareamazon.es para crear o gestionar enlaces compartibles.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)$authUser['id'];
$isAdmin = ($authUser['role'] ?? 'user') === 'admin';

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Cuerpo vacío']);
    exit;
}

if (strlen($raw) > 2 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['ok' => false, 'error' => 'La comparativa supera el tamaño máximo (2 MB)']);
    exit;
}

$input = json_decode($raw, true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
    exit;
}

// Handle DELETE action with id + editToken
if (($input['action'] ?? '') === 'delete') {
    $delId = trim((string)($input['id'] ?? ''));
    $delToken = trim((string)($input['editToken'] ?? ''));
    if (!preg_match('/^[A-Za-z0-9_-]{4,16}$/', $delId) || $delToken === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Parámetros de borrado inválidos']);
        exit;
    }
    try {
        $pdo = getDb();
        $chk = $pdo->prepare('SELECT edit_token, user_id FROM comparisons WHERE id = ? LIMIT 1');
        $chk->execute([$delId]);
        $rowDel = $chk->fetch(PDO::FETCH_ASSOC);
        $isOwner = $rowDel && ((int)$rowDel['user_id'] === $userId || $isAdmin);
        $tokenOk = $rowDel && !empty($rowDel['edit_token']) && hash_equals((string)$rowDel['edit_token'], $delToken);
        if (!$rowDel || (!$isOwner && !$tokenOk)) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'No tienes permiso para borrar este enlace']);
            exit;
        }
        $del = $pdo->prepare('DELETE FROM comparisons WHERE id = ?');
        $del->execute([$delId]);
        echo json_encode(['ok' => true, 'deleted' => true]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Error al borrar']);
    }
    exit;
}

if (empty($input['products']) || !is_array($input['products'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Faltan productos válidos']);
    exit;
}

$products = array_slice($input['products'], 0, 20);
$cleanedProducts = [];
foreach ($products as $p) {
    if (!is_array($p)) continue;
    unset($p['tabId'], $p['_sortedReviews']);
    $cleanedProducts[] = $p;
}

if (count($cleanedProducts) === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'No hay productos válidos para guardar']);
    exit;
}

$title = trim((string)($input['title'] ?? ''));
if ($title === '') {
    $count = count($cleanedProducts);
    $title = $count === 1
        ? mb_substr((string)($cleanedProducts[0]['title'] ?? 'Producto de Amazon'), 0, 120)
        : "Comparativa de {$count} productos de Amazon";
}
$title = mb_substr($title, 0, 180);

$theme = ($input['theme'] ?? 'light') === 'dark' ? 'dark' : 'light';
$isPublic = !empty($input['isPublic']) ? 1 : 0;
$notes = is_array($input['notes'] ?? null) ? $input['notes'] : [];
$favorites = is_array($input['favorites'] ?? null) ? array_values($input['favorites']) : [];

$payloadJson = json_encode([
    'products' => $cleanedProducts,
    'notes' => $notes,
    'favorites' => $favorites,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($payloadJson === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error codificando JSON']);
    exit;
}

function generateSlug(int $length = 8): string {
    $alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
    $max = strlen($alphabet) - 1;
    $bytes = random_bytes($length);
    $out = '';
    for ($i = 0; $i < $length; $i++) {
        $out .= $alphabet[ord($bytes[$i]) % ($max + 1)];
    }
    return $out;
}

try {
    $pdo = getDb();

    $reqId = trim((string)($input['id'] ?? ''));
    $reqToken = trim((string)($input['editToken'] ?? ''));

    // Update existing shared comparison if valid id + matching editToken
    if ($reqId !== '' && $reqToken !== '' && preg_match('/^[A-Za-z0-9_-]{4,16}$/', $reqId)) {
        $chk = $pdo->prepare('SELECT edit_token FROM comparisons WHERE id = ? LIMIT 1');
        $chk->execute([$reqId]);
        $existingToken = $chk->fetchColumn();

        if ($existingToken && hash_equals((string)$existingToken, $reqToken)) {
            $upd = $pdo->prepare(
                'UPDATE comparisons SET title = ?, products_count = ?, payload = ?, theme = ?, is_public = ? WHERE id = ?'
            );
            $upd->execute([$title, count($cleanedProducts), $payloadJson, $theme, $isPublic, $reqId]);
            echo json_encode([
                'ok' => true,
                'updated' => true,
                'id' => $reqId,
                'url' => 'https://www.compareamazon.es/c/' . $reqId,
                'editToken' => $reqToken,
            ], JSON_UNESCAPED_SLASHES);
            exit;
        }
    }

    $slug = '';
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $candidate = generateSlug(8);
        $stmt = $pdo->prepare('SELECT 1 FROM comparisons WHERE id = ? LIMIT 1');
        $stmt->execute([$candidate]);
        if (!$stmt->fetchColumn()) {
            $slug = $candidate;
            break;
        }
    }

    if ($slug === '') {
        throw new RuntimeException('No se pudo generar un identificador único');
    }

    $editToken = bin2hex(random_bytes(16));
    $insert = $pdo->prepare(
        'INSERT INTO comparisons (id, edit_token, user_id, is_public, title, products_count, payload, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insert->execute([$slug, $editToken, $userId, $isPublic, $title, count($cleanedProducts), $payloadJson, $theme]);

    $url = 'https://www.compareamazon.es/c/' . $slug;
    echo json_encode([
        'ok' => true,
        'id' => $slug,
        'url' => $url,
        'editToken' => $editToken,
    ], JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error guardando la comparativa en el servidor',
    ]);
}
