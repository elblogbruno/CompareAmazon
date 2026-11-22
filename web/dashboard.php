<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/private/config.php';
require_once dirname(__DIR__) . '/private/auth.php';

$user = requireAuth();
$isAdmin = ($user['role'] ?? 'user') === 'admin';
$pdo = getDb();
$flash = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && verifyCsrf($_POST['csrf'] ?? '')) {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'toggle_public') {
        $cid = trim((string)($_POST['cid'] ?? ''));
        if ($isAdmin) {
            $pdo->prepare('UPDATE comparisons SET is_public = IF(is_public = 1, 0, 1) WHERE id = ?')->execute([$cid]);
        } else {
            $pdo->prepare('UPDATE comparisons SET is_public = IF(is_public = 1, 0, 1) WHERE id = ? AND user_id = ?')->execute([$cid, $user['id']]);
        }
        $flash = 'Visibilidad actualizada.';
    } elseif ($action === 'delete_cmp') {
        $cid = trim((string)($_POST['cid'] ?? ''));
        if ($isAdmin) {
            $pdo->prepare('DELETE FROM comparisons WHERE id = ?')->execute([$cid]);
        } else {
            $pdo->prepare('DELETE FROM comparisons WHERE id = ? AND user_id = ?')->execute([$cid, $user['id']]);
        }
        $flash = 'Comparativa eliminada.';
    } elseif ($action === 'claim_cmp') {
        $rawLink = trim((string)($_POST['link'] ?? ''));
        if (preg_match('/([A-Za-z0-9_-]{4,16})\/?$/', $rawLink, $m)) {
            $cid = $m[1];
            $upd = $pdo->prepare('UPDATE comparisons SET user_id = ? WHERE id = ? AND user_id IS NULL');
            $upd->execute([$user['id'], $cid]);
            $flash = $upd->rowCount() > 0 ? "Comparativa {$cid} vinculada a tu cuenta." : 'No se encontró o ya pertenece a un usuario.';
        }
    } elseif ($isAdmin && $action === 'toggle_role') {
        $uid = (int)($_POST['uid'] ?? 0);
        if ($uid > 0 && $uid !== (int)$user['id']) {
            $pdo->prepare("UPDATE users SET role = IF(role = 'admin', 'user', 'admin') WHERE id = ?")->execute([$uid]);
            $flash = 'Rol de usuario actualizado.';
        }
    } elseif ($isAdmin && $action === 'delete_user') {
        $uid = (int)($_POST['uid'] ?? 0);
        if ($uid > 0 && $uid !== (int)$user['id']) {
            $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$uid]);
            $flash = 'Usuario eliminado.';
        }
    }
}

$myStmt = $pdo->prepare(
    'SELECT c.id, c.title, c.products_count, c.views, c.is_public, c.created_at,
            (SELECT COUNT(*) FROM comparison_votes v WHERE v.comparison_id = c.id) AS votes_count
     FROM comparisons c WHERE c.user_id = ? ORDER BY c.created_at DESC LIMIT 50'
);
$myStmt->execute([$user['id']]);
$myComparisons = $myStmt->fetchAll(PDO::FETCH_ASSOC);

$adminStats = null;
$allComparisons = [];
$allUsers = [];
if ($isAdmin) {
    $adminStats = [
        'comparisons' => (int)$pdo->query('SELECT COUNT(*) FROM comparisons')->fetchColumn(),
        'views' => (int)$pdo->query('SELECT COALESCE(SUM(views), 0) FROM comparisons')->fetchColumn(),
        'votes' => (int)$pdo->query('SELECT COUNT(*) FROM comparison_votes')->fetchColumn(),
        'users' => (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    ];
    $allComparisons = $pdo->query(
        'SELECT c.id, c.title, c.products_count, c.views, c.is_public, c.created_at, u.username,
                (SELECT COUNT(*) FROM comparison_votes v WHERE v.comparison_id = c.id) AS votes_count
         FROM comparisons c LEFT JOIN users u ON u.id = c.user_id
         ORDER BY c.created_at DESC LIMIT 100'
    )->fetchAll(PDO::FETCH_ASSOC);
    $allUsers = $pdo->query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100')->fetchAll(PDO::FETCH_ASSOC);
}

$token = csrfToken();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mi Panel — CompareAmazon</title>
  <link rel="stylesheet" href="/assets/landing.css" />
  <script defer src="https://umami.brunomoya.com/script.js" data-website-id="0c6c7b8c-4e2d-4c1e-89b7-df0611212c0f"></script>
  <style>
    .dash-wrap { padding: 36px 0 64px; display:flex; flex-direction:column; gap:28px; }
    .flash { background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; padding:10px 14px; border-radius:10px; font-size:13.5px; font-weight:600; }
    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; }
    .kpi-card { border:1px solid var(--border); border-radius:12px; padding:18px; background:#fff; }
    .kpi-card span { font-size:12.5px; color:var(--muted); font-weight:600; }
    .kpi-card strong { display:block; font-size:26px; margin-top:4px; }
    .panel-box { border:1px solid var(--border); border-radius:14px; background:#fff; padding:22px; overflow-x:auto; }
    .panel-box h2 { font-size:18px; margin-bottom:14px; }
    table.adm { width:100%; border-collapse:collapse; font-size:13.5px; }
    table.adm th, table.adm td { text-align:left; padding:10px 12px; border-bottom:1px solid var(--border); }
    table.adm th { color:var(--muted); font-size:12px; text-transform:uppercase; }
    .badge-pub { background:#ecfdf5; color:#047857; padding:2px 8px; border-radius:999px; font-size:11.5px; font-weight:700; }
    .badge-priv { background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:999px; font-size:11.5px; font-weight:700; }
    .inline-form { display:inline; }
    .mini-btn { padding:4px 9px; border-radius:7px; border:1px solid var(--border); background:#f8fafc; font-size:12px; font-weight:600; cursor:pointer; }
    .mini-btn.danger { color:#dc2626; }
    .claim-bar { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
    .claim-bar input { flex:1; min-width:220px; padding:8px 12px; border-radius:9px; border:1px solid var(--border); font-size:13.5px; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <a href="/" class="logo"><span class="logo-mark">🛒</span><span>CompareAmazon</span></a>
      <div class="nav-links">
        <a href="/explorar">Explorar</a>
        <a href="/panel" style="color:var(--primary);">Panel (@<?= htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8') ?>)</a>
        <a href="/salir" class="btn btn-outline btn-sm">Cerrar sesión</a>
      </div>
    </div>
  </nav>

  <main class="container dash-wrap">
    <?php if ($flash !== ''): ?>
      <div class="flash"><?= htmlspecialchars($flash, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>

    <?php if ($isAdmin && $adminStats): ?>
      <section>
        <h1 style="font-size:24px; margin-bottom:14px;">Panel de Administración</h1>
        <div class="kpi-grid">
          <div class="kpi-card"><span>Comparativas totales</span><strong><?= $adminStats['comparisons'] ?></strong></div>
          <div class="kpi-card"><span>Visitas totales</span><strong><?= $adminStats['views'] ?></strong></div>
          <div class="kpi-card"><span>Votos / comentarios</span><strong><?= $adminStats['votes'] ?></strong></div>
          <div class="kpi-card"><span>Usuarios registrados</span><strong><?= $adminStats['users'] ?></strong></div>
        </div>
      </section>
    <?php endif; ?>

    <section class="panel-box">
      <h2>Mis comparativas</h2>
      <form class="claim-bar" method="post">
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
        <input type="hidden" name="action" value="claim_cmp" />
        <input type="text" name="link" placeholder="¿Creaste un enlace antes de iniciar sesión? Pega su URL o ID aquí para vincularlo..." />
        <button type="submit" class="btn btn-primary btn-sm" style="border:none;" data-umami-event="dashboard_claim_link">Vincular enlace</button>
      </form>
      <?php if (count($myComparisons) === 0): ?>
        <p style="color:var(--muted); font-size:14px;">Todavía no tienes comparativas vinculadas a tu cuenta.</p>
      <?php else: ?>
        <table class="adm">
          <thead><tr><th>Título</th><th>Productos</th><th>Visitas</th><th>Votos</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            <?php foreach ($myComparisons as $c): ?>
              <tr>
                <td><a href="/c/<?= rawurlencode($c['id']) ?>" target="_blank" style="font-weight:600; color:var(--primary);"><?= htmlspecialchars($c['title'], ENT_QUOTES, 'UTF-8') ?></a></td>
                <td><?= (int)$c['products_count'] ?></td>
                <td><?= (int)$c['views'] ?></td>
                <td><?= (int)$c['votes_count'] ?></td>
                <td><?= $c['is_public'] ? '<span class="badge-pub">Pública</span>' : '<span class="badge-priv">Privada</span>' ?></td>
                <td>
                  <form class="inline-form" method="post">
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
                    <input type="hidden" name="action" value="toggle_public" />
                    <input type="hidden" name="cid" value="<?= htmlspecialchars($c['id'], ENT_QUOTES, 'UTF-8') ?>" />
                    <button class="mini-btn" type="submit" data-umami-event="dashboard_toggle_visibility"><?= $c['is_public'] ? 'Hacer privada' : 'Hacer pública' ?></button>
                  </form>
                  <form class="inline-form" method="post" onsubmit="return confirm('¿Eliminar esta comparativa?');">
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
                    <input type="hidden" name="action" value="delete_cmp" />
                    <input type="hidden" name="cid" value="<?= htmlspecialchars($c['id'], ENT_QUOTES, 'UTF-8') ?>" />
                    <button class="mini-btn danger" type="submit" data-umami-event="dashboard_delete_comparison">Borrar</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </section>

    <?php if ($isAdmin): ?>
      <section class="panel-box">
        <h2>Todas las comparativas (Admin)</h2>
        <table class="adm">
          <thead><tr><th>ID / Título</th><th>Autor</th><th>Prod.</th><th>Visitas</th><th>Votos</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            <?php foreach ($allComparisons as $c): ?>
              <tr>
                <td><a href="/c/<?= rawurlencode($c['id']) ?>" target="_blank" style="font-weight:600; color:var(--primary);"><?= htmlspecialchars($c['title'], ENT_QUOTES, 'UTF-8') ?></a> <small style="color:var(--muted);">(<?= htmlspecialchars($c['id'], ENT_QUOTES, 'UTF-8') ?>)</small></td>
                <td><?= $c['username'] ? '@' . htmlspecialchars($c['username'], ENT_QUOTES, 'UTF-8') : '<span style="color:var(--muted);">Anónimo</span>' ?></td>
                <td><?= (int)$c['products_count'] ?></td>
                <td><?= (int)$c['views'] ?></td>
                <td><?= (int)$c['votes_count'] ?></td>
                <td><?= $c['is_public'] ? '<span class="badge-pub">Pública</span>' : '<span class="badge-priv">Privada</span>' ?></td>
                <td>
                  <form class="inline-form" method="post">
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
                    <input type="hidden" name="action" value="toggle_public" />
                    <input type="hidden" name="cid" value="<?= htmlspecialchars($c['id'], ENT_QUOTES, 'UTF-8') ?>" />
                    <button class="mini-btn" type="submit"><?= $c['is_public'] ? 'Privada' : 'Pública' ?></button>
                  </form>
                  <form class="inline-form" method="post" onsubmit="return confirm('¿Eliminar esta comparativa?');">
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
                    <input type="hidden" name="action" value="delete_cmp" />
                    <input type="hidden" name="cid" value="<?= htmlspecialchars($c['id'], ENT_QUOTES, 'UTF-8') ?>" />
                    <button class="mini-btn danger" type="submit">Borrar</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </section>

      <section class="panel-box">
        <h2>Usuarios registrados (Admin)</h2>
        <table class="adm">
          <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Registro</th><th>Acciones</th></tr></thead>
          <tbody>
            <?php foreach ($allUsers as $uRow): ?>
              <tr>
                <td><strong>@<?= htmlspecialchars($uRow['username'], ENT_QUOTES, 'UTF-8') ?></strong></td>
                <td><?= htmlspecialchars($uRow['email'], ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= $uRow['role'] === 'admin' ? '<span class="badge-pub">Admin</span>' : '<span class="badge-priv">Usuario</span>' ?></td>
                <td><?= htmlspecialchars(date('d/m/Y', strtotime($uRow['created_at'])), ENT_QUOTES, 'UTF-8') ?></td>
                <td>
                  <?php if ((int)$uRow['id'] !== (int)$user['id']): ?>
                    <form class="inline-form" method="post">
                      <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
                      <input type="hidden" name="action" value="toggle_role" />
                      <input type="hidden" name="uid" value="<?= (int)$uRow['id'] ?>" />
                      <button class="mini-btn" type="submit"><?= $uRow['role'] === 'admin' ? 'Quitar admin' : 'Hacer admin' ?></button>
                    </form>
                    <form class="inline-form" method="post" onsubmit="return confirm('¿Eliminar usuario?');">
                      <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
                      <input type="hidden" name="action" value="delete_user" />
                      <input type="hidden" name="uid" value="<?= (int)$uRow['id'] ?>" />
                      <button class="mini-btn danger" type="submit">Borrar</button>
                    </form>
                  <?php else: ?>
                    <span style="color:var(--muted); font-size:12px;">(Tú)</span>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </section>
    <?php endif; ?>
  </main>
</body>
</html>
