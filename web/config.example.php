<?php
declare(strict_types=1);

// Copy to ../private/config.php on your server and fill in your DB credentials.

const AMAZON_AFFILIATE_TAGS = [
    'amazon.es' => '',
    'amazon.com' => '',
    'amazon.de' => '',
    'amazon.fr' => '',
    'amazon.it' => '',
    'amazon.co.uk' => '',
];

function applyAffiliateTag(string $url): string {
    $parts = parse_url($url);
    if (!$parts || empty($parts['host'])) return $url;
    $host = preg_replace('/^www\./i', '', strtolower($parts['host']));
    $tag = AMAZON_AFFILIATE_TAGS[$host] ?? '';
    if ($tag === '') return $url;
    $query = [];
    if (!empty($parts['query'])) {
        parse_str($parts['query'], $query);
    }
    $query['tag'] = $tag;
    $base = ($parts['scheme'] ?? 'https') . '://' . $parts['host'] . ($parts['path'] ?? '');
    return $base . '?' . http_build_query($query);
}

function getDb(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = 'mysql:host=localhost;dbname=YOUR_DB_NAME;charset=utf8mb4';
    $user = 'YOUR_DB_USER';
    $pass = 'YOUR_DB_PASSWORD';
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
