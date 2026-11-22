<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/private/config.php';
require_once dirname(__DIR__) . '/private/auth.php';

$user = currentUser();
$q = trim((string)($_GET['q'] ?? ''));
$pdo = getDb();

if ($q !== '') {
    $stmt = $pdo->prepare(
        'SELECT c.id, c.title, c.products_count, c.payload, c.views, c.created_at, u.username,
                (SELECT COUNT(*) FROM comparison_votes v WHERE v.comparison_id = c.id) AS votes_count
         FROM comparisons c
         LEFT JOIN users u ON u.id = c.user_id
         WHERE c.is_public = 1 AND c.title LIKE ?
         ORDER BY c.created_at DESC LIMIT 40'
    );
    $stmt->execute(['%' . $q . '%']);
} else {
    $stmt = $pdo->query(
        'SELECT c.id, c.title, c.products_count, c.payload, c.views, c.created_at, u.username,
                (SELECT COUNT(*) FROM comparison_votes v WHERE v.comparison_id = c.id) AS votes_count
         FROM comparisons c
         LEFT JOIN users u ON u.id = c.user_id
         WHERE c.is_public = 1
         ORDER BY c.created_at DESC LIMIT 40'
    );
}
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Explorar comparativas — CompareAmazon</title>
  <link rel="stylesheet" href="/assets/landing.css" />
  <style>
    .explore-head { padding: 40px 0 24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; }
    .explore-search { display:flex; gap:8px; }
    .explore-search input { padding:10px 14px; border-radius:10px; border:1px solid var(--border); font-size:14px; width:260px; }
    .explore-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px; padding-bottom:64px; }
    .cmp-card { border:1px solid var(--border); border-radius:14px; background:#fff; padding:18px; display:flex; flex-direction:column; gap:12px; text-decoration:none; color:inherit; transition:transform .12s, box-shadow .15s, border-color .15s; }
    .cmp-card:hover { transform:translateY(-2px); border-color:var(--primary); box-shadow:0 12px 28px rgba(15,23,42,.08); }
    .cmp-thumbs { display:flex; gap:8px; height:64px; align-items:center; }
    .cmp-thumbs img { width:58px; height:58px; object-fit:contain; border:1px solid var(--border); border-radius:8px; padding:4px; background:#fff; }
    .cmp-title { font-size:16px; font-weight:700; line-height:1.35; }
    .cmp-meta { font-size:12.5px; color:var(--muted); display:flex; flex-wrap:wrap; gap:10px; margin-top:auto; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <a href="/" class="logo">
        <span class="logo-mark">🛒</span>
        <span>CompareAmazon</span>
      </a>
      <div class="nav-links">
        <a href="/">Inicio</a>
        <a href="/explorar" style="color:var(--primary);">Explorar</a>
        <?php if ($user): ?>
          <a href="/panel" class="btn btn-primary btn-sm">Mi panel (<?= htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8') ?>)</a>
        <?php else: ?>
          <a href="/cuenta" class="btn btn-primary btn-sm">Entrar / Crear cuenta</a>
        <?php endif; ?>
      </div>
    </div>
  </nav>

  <main class="container">
    <div class="explore-head">
      <div>
        <h1 style="font-size:28px;letter-spacing:-0.02em;">Explorar comparativas recientes</h1>
        <p style="color:var(--muted);">Comparativas públicas compartidas por la comunidad de CompareAmazon.</p>
      </div>
      <form class="explore-search" method="get" action="/explorar">
        <input type="search" name="q" value="<?= htmlspecialchars($q, ENT_QUOTES, 'UTF-8') ?>" placeholder="Buscar comparativas..." />
        <button type="submit" class="btn btn-primary btn-sm">Buscar</button>
      </form>
    </div>

    <?php if (count($rows) === 0): ?>
      <div style="text-align:center; padding:64px 20px; border:1px dashed var(--border); border-radius:16px; margin-bottom:64px;">
        <div style="font-size:38px; margin-bottom:10px;">🔎</div>
        <h2 style="font-size:20px; margin-bottom:6px;">Aún no hay comparativas públicas</h2>
        <p style="color:var(--muted); margin-bottom:18px;">Cuando compartas una comparativa desde la extensión, marca <em>"Hacer pública en Explorar"</em> para que aparezca aquí.</p>
        <a href="/#instalar" class="btn btn-primary btn-sm">Descargar extensión</a>
      </div>
    <?php else: ?>
      <div class="explore-grid">
        <?php foreach ($rows as $r):
          $data = json_decode($r['payload'], true);
          $imgs = [];
          foreach (($data['products'] ?? []) as $p) {
            if (!empty($p['image'])) $imgs[] = $p['image'];
            if (count($imgs) >= 4) break;
          }
        ?>
          <a class="cmp-card" href="/c/<?= rawurlencode($r['id']) ?>">
            <?php if ($imgs): ?>
              <div class="cmp-thumbs">
                <?php foreach ($imgs as $u): ?>
                  <img src="<?= htmlspecialchars($u, ENT_QUOTES, 'UTF-8') ?>" alt="" loading="lazy" />
                <?php endforeach; ?>
              </div>
            <?php endif; ?>
            <div class="cmp-title"><?= htmlspecialchars($r['title'], ENT_QUOTES, 'UTF-8') ?></div>
            <div class="cmp-meta">
              <span>📦 <?= (int)$r['products_count'] ?> productos</span>
              <span>👁️ <?= (int)$r['views'] ?></span>
              <span>👍 <?= (int)$r['votes_count'] ?></span>
              <?php if (!empty($r['username'])): ?>
                <span>por @<?= htmlspecialchars($r['username'], ENT_QUOTES, 'UTF-8') ?></span>
              <?php endif; ?>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </main>
</body>
</html>
