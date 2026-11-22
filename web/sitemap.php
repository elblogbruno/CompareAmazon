<?php
declare(strict_types=1);

header('Content-Type: application/xml; charset=UTF-8');

$baseUrl = 'https://www.compareamazon.es';
$today = date('Y-m-d');

$staticUrls = [
    ['loc' => $baseUrl . '/', 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => '1.0'],
    ['loc' => $baseUrl . '/explorar', 'lastmod' => $today, 'changefreq' => 'daily', 'priority' => '0.9'],
    ['loc' => $baseUrl . '/privacidad', 'lastmod' => $today, 'changefreq' => 'monthly', 'priority' => '0.3'],
];

$publicComparisons = [];
try {
    $configPath = dirname(__DIR__) . '/private/config.php';
    if (file_exists($configPath)) {
        require_once $configPath;
        $pdo = getDb();
        $stmt = $pdo->query('SELECT id, created_at FROM comparisons WHERE is_public = 1 ORDER BY created_at DESC LIMIT 1000');
        $publicComparisons = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }
} catch (Throwable $e) {
    $publicComparisons = [];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($staticUrls as $item) {
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars($item['loc'], ENT_XML1, 'UTF-8') . "</loc>\n";
    echo '    <lastmod>' . htmlspecialchars($item['lastmod'], ENT_XML1, 'UTF-8') . "</lastmod>\n";
    echo '    <changefreq>' . htmlspecialchars($item['changefreq'], ENT_XML1, 'UTF-8') . "</changefreq>\n";
    echo '    <priority>' . htmlspecialchars($item['priority'], ENT_XML1, 'UTF-8') . "</priority>\n";
    echo "  </url>\n";
}

foreach ($publicComparisons as $row) {
    $loc = $baseUrl . '/c/' . rawurlencode((string)$row['id']);
    $lastmod = !empty($row['created_at']) ? date('Y-m-d', strtotime((string)$row['created_at'])) : $today;
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars($loc, ENT_XML1, 'UTF-8') . "</loc>\n";
    echo '    <lastmod>' . htmlspecialchars($lastmod, ENT_XML1, 'UTF-8') . "</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.7</priority>\n";
    echo "  </url>\n";
}

echo "</urlset>\n";
