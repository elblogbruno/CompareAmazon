<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/private/config.php';

$id = trim((string)($_GET['id'] ?? ''));
$row = null;

if (preg_match('/^[A-Za-z0-9_-]{4,16}$/', $id)) {
    try {
        $pdo = getDb();
        $stmt = $pdo->prepare('SELECT id, title, products_count, payload, theme, views, created_at FROM comparisons WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        if ($row) {
            $upd = $pdo->prepare('UPDATE comparisons SET views = views + 1 WHERE id = ?');
            $upd->execute([$id]);
            $row['views'] = (int)$row['views'] + 1;
        }
    } catch (Throwable $e) {
        $row = null;
    }
}

if (!$row) {
    http_response_code(404);
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Comparativa no encontrada — CompareAmazon</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/compare.css?v=14" />
    </head>
    <body>
      <header class="topbar">
        <div class="topbar-left">
          <a href="/" style="text-decoration:none;display:flex;align-items:center;gap:12px;color:inherit;">
            <div class="brand-badge">🛒</div>
            <div>
              <h1>CompareAmazon</h1>
              <p class="subtitle">Comparador inteligente de Amazon</p>
            </div>
          </a>
        </div>
        <div class="topbar-actions">
          <a href="/" class="btn btn-ai-custom" style="text-decoration:none;">Ir a la portada</a>
        </div>
      </header>
      <main class="main-content">
        <div class="table-wrapper">
          <div class="empty-page">
            <div style="font-size:44px;">🔎</div>
            <h2>Esta comparativa no existe o ha expirado</h2>
            <p>Comprueba que el enlace esté completo o crea una nueva comparativa con la extensión CompareAmazon.</p>
            <div style="margin-top:20px;">
              <a href="/" class="btn btn-ai-custom" style="text-decoration:none;">Conocer CompareAmazon</a>
            </div>
          </div>
        </div>
      </main>
    </body>
    </html>
    <?php
    exit;
}

$data = json_decode($row['payload'], true) ?: ['products' => [], 'notes' => [], 'favorites' => []];
$products = $data['products'] ?? [];

// Optional Amazon Affiliate tag injection (configured in private/config.php)
if (function_exists('applyAffiliateTag')) {
    foreach ($products as &$prod) {
        if (!empty($prod['url'])) {
            $prod['url'] = applyAffiliateTag((string)$prod['url']);
        }
    }
    unset($prod);
}

// Load votes & comments
$votesGrouped = [];
try {
    $vStmt = $pdo->prepare(
        'SELECT product_key, voter_name, comment, created_at FROM comparison_votes WHERE comparison_id = ? ORDER BY created_at DESC LIMIT 200'
    );
    $vStmt->execute([$row['id']]);
    foreach ($vStmt->fetchAll(PDO::FETCH_ASSOC) as $vRow) {
        $k = $vRow['product_key'];
        if (!isset($votesGrouped[$k])) {
            $votesGrouped[$k] = ['count' => 0, 'items' => []];
        }
        $votesGrouped[$k]['count']++;
        $votesGrouped[$k]['items'][] = [
            'voter' => $vRow['voter_name'],
            'comment' => $vRow['comment'],
            'createdAt' => $vRow['created_at'],
        ];
    }
} catch (Throwable $e) {
    $votesGrouped = [];
}

$firstImg = '';
foreach ($products as $p) {
    if (!empty($p['image'])) {
        $firstImg = (string)$p['image'];
        break;
    }
}

$pageTitle = htmlspecialchars($row['title'], ENT_QUOTES, 'UTF-8');
$ogDesc = htmlspecialchars(
    'Comparativa interactiva de ' . count($products) . ' productos de Amazon: precios, cupones, valoraciones, fotos, reseñas y especificaciones.',
    ENT_QUOTES,
    'UTF-8'
);
$theme = $row['theme'] === 'dark' ? 'dark' : 'light';
$shareUrl = 'https://www.compareamazon.es/c/' . rawurlencode($row['id']);
$createdFormatted = date('d/m/Y H:i', strtotime($row['created_at']));

$bootstrapJson = json_encode([
    'id' => $row['id'],
    'title' => $row['title'],
    'shareUrl' => $shareUrl,
    'createdAt' => $createdFormatted,
    'views' => (int)$row['views'],
    'theme' => $theme,
    'products' => $products,
    'notes' => $data['notes'] ?? [],
    'favorites' => $data['favorites'] ?? [],
    'votes' => $votesGrouped,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
?>
<!DOCTYPE html>
<html lang="es" data-theme="<?= $theme ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= $pageTitle ?> — CompareAmazon</title>
  <meta name="description" content="<?= $ogDesc ?>" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="<?= $pageTitle ?> — CompareAmazon" />
  <meta property="og:description" content="<?= $ogDesc ?>" />
  <meta property="og:url" content="<?= htmlspecialchars($shareUrl, ENT_QUOTES, 'UTF-8') ?>" />
  <?php if ($firstImg !== ''): ?>
  <meta property="og:image" content="<?= htmlspecialchars($firstImg, ENT_QUOTES, 'UTF-8') ?>" />
  <?php endif; ?>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/compare.css?v=14" />
</head>
<body>
  <header class="topbar">
    <div class="topbar-left">
      <a href="/" style="text-decoration:none;display:flex;align-items:center;gap:12px;color:inherit;" title="Ir a CompareAmazon.es">
        <div class="brand-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="18" rx="1.5"></rect>
          </svg>
        </div>
        <div>
          <h1><?= $pageTitle ?></h1>
          <p class="subtitle" id="headerSubtitle">
            <?= count($products) ?> productos · Compartida el <?= $createdFormatted ?> · <?= (int)$row['views'] ?> visitas
          </p>
        </div>
      </a>
    </div>

    <div class="topbar-actions">
      <button type="button" class="btn btn-ghost" id="copyLinkBtn" title="Copiar enlace de esta comparativa">
        <svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span>Copiar enlace</span>
      </button>

      <div class="menu-wrap">
        <button type="button" class="btn btn-ai-custom" id="aiMenuBtn">
          <svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/></svg>
          <span>Preguntar a IA</span>
          <svg class="svg-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.85;"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="dropdown-menu hidden" id="aiDropdown">
          <button type="button" class="dropdown-item" id="quickChatGptBtn">
            <span class="dot-badge" style="background:#10a37f;"></span> ChatGPT
          </button>
          <button type="button" class="dropdown-item" id="quickClaudeBtn">
            <span class="dot-badge" style="background:#d97757;"></span> Claude
          </button>
          <button type="button" class="dropdown-item" id="quickGeminiBtn">
            <span class="dot-badge" style="background:#2563eb;"></span> Gemini
          </button>
          <button type="button" class="dropdown-item" id="quickPerplexityBtn">
            <span class="dot-badge" style="background:#0e7490;"></span> Perplexity
          </button>
        </div>
      </div>

      <a href="/#instalar" class="btn btn-ghost" style="text-decoration:none;">
        <svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Extensión</span>
      </a>
      <button type="button" class="btn btn-ghost icon-only" id="themeToggleBtn" title="Cambiar tema claro/oscuro">
        <svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </header>

  <section class="controls-bar">
    <div class="controls-group">
      <label class="control-select">
        <span>Ordenar:</span>
        <select id="sortSelect">
          <option value="original">Orden original</option>
          <option value="score-desc">Mejor puntuación (Score)</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="rating-desc">Mejor valorados</option>
          <option value="reviews-desc">Más reseñas</option>
        </select>
      </label>

      <label class="budget-box" title="Presupuesto máximo">
        <span>Máx:</span>
        <input type="number" id="maxBudgetInput" min="0" step="1" placeholder="€" />
      </label>

      <button type="button" class="btn btn-ghost btn-sm" id="toggleScorePanelBtn">
        <svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        <span>Score</span>
      </button>
      <button type="button" class="btn btn-ghost btn-sm" id="toggleViewModeBtn" title="Alternar entre tabla y tarjetas (ideal para móvil)">
        <svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        <span>Tarjetas</span>
      </button>

      <label class="toggle-chip">
        <input type="checkbox" id="diffOnlyToggle" />
        <span>Solo diferencias</span>
      </label>

      <label class="toggle-chip">
        <input type="checkbox" id="commonOnlyToggle" />
        <span>Ocultar specs únicas</span>
      </label>
    </div>

    <div class="controls-group">
      <div class="search-box">
        <input type="search" id="specSearchInput" placeholder="Filtrar especificaciones..." />
      </div>
    </div>
  </section>

  <section class="score-panel hidden" id="scorePanel">
    <span class="score-panel-title">⚖️ Pesos del Score (sobre 10):</span>
    <label class="slider-group">
      <span>Precio (<strong id="weightPriceVal">40</strong>%)</span>
      <input type="range" id="weightPrice" min="0" max="100" value="40" />
    </label>
    <label class="slider-group">
      <span>Valoración (<strong id="weightRatingVal">40</strong>%)</span>
      <input type="range" id="weightRating" min="0" max="100" value="40" />
    </label>
    <label class="slider-group">
      <span>Nº Reseñas (<strong id="weightReviewsVal">20</strong>%)</span>
      <input type="range" id="weightReviews" min="0" max="100" value="20" />
    </label>
  </section>

  <main class="main-content">
    <div class="table-wrapper" id="tableWrapper"></div>
    <div class="mobile-cards-grid hidden" id="cardsWrapper"></div>
  </main>

  <!-- Vote / Comment Modal -->
  <div class="modal-backdrop hidden" id="voteModalBackdrop">
    <div class="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="voteModalTitle">
      <div class="modal-header">
        <div>
          <h2 id="voteModalTitle">Votar esta opción</h2>
          <p class="modal-subtitle" id="voteProductLabel"></p>
        </div>
        <button type="button" class="close-btn" id="closeVoteModalBtn" aria-label="Cerrar">&times;</button>
      </div>
      <div class="modal-body">
        <label class="field-label" for="voterNameInput">Tu nombre</label>
        <input type="text" class="text-input" id="voterNameInput" placeholder="Ej: Laura, Mamá, Carlos..." />
        <label class="field-label" for="voterCommentInput">Comentario (opcional)</label>
        <textarea id="voterCommentInput" rows="3" placeholder="Ej: Me gusta más este por el tamaño y el precio..."></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" id="cancelVoteBtn">Cancelar</button>
        <button type="button" class="btn btn-ai-custom" id="confirmVoteBtn">👍 Enviar voto</button>
      </div>
    </div>
  </div>

  <!-- Image Lightbox Modal -->
  <div class="lightbox-backdrop hidden" id="imageLightbox" role="dialog" aria-modal="true">
    <div class="lightbox-content">
      <div class="lightbox-header">
        <div class="lightbox-title" id="lightboxTitle"></div>
        <div class="lightbox-header-right">
          <span class="lightbox-counter" id="lightboxCounter">1 / 1</span>
          <button type="button" class="lightbox-close" id="lightboxCloseBtn" aria-label="Cerrar">&times;</button>
        </div>
      </div>
      <div class="lightbox-stage">
        <button type="button" class="lightbox-nav prev" id="lightboxPrevBtn" aria-label="Foto anterior">&#8249;</button>
        <img id="lightboxImg" src="" alt="" />
        <button type="button" class="lightbox-nav next" id="lightboxNextBtn" aria-label="Foto siguiente">&#8250;</button>
      </div>
      <div class="lightbox-thumbs" id="lightboxThumbs"></div>
    </div>
  </div>

  <div class="toast hidden" id="toast"></div>

  <script>window.__SHARED_COMPARE__ = <?= $bootstrapJson ?>;</script>
  <script src="/assets/view.js?v=14"></script>
</body>
</html>
