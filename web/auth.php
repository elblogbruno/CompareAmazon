<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/private/config.php';
require_once dirname(__DIR__) . '/private/auth.php';

if (currentUser()) {
    header('Location: /panel');
    exit;
}

$error = '';
$mode = ($_GET['mode'] ?? $_POST['mode'] ?? 'login') === 'register' ? 'register' : 'login';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf($_POST['csrf'] ?? '')) {
        $error = 'Sesión caducada, vuelve a intentarlo.';
    } else {
        $pdo = getDb();
        if ($mode === 'register') {
            $username = trim((string)($_POST['username'] ?? ''));
            $email = strtolower(trim((string)($_POST['email'] ?? '')));
            $password = (string)($_POST['password'] ?? '');

            if (!preg_match('/^[a-zA-Z0-9_.-]{3,30}$/', $username)) {
                $error = 'El usuario debe tener entre 3 y 30 caracteres (letras, números, _ o .).';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'Introduce un correo electrónico válido.';
            } elseif (strlen($password) < 6) {
                $error = 'La contraseña debe tener al menos 6 caracteres.';
            } else {
                $chk = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
                $chk->execute([$username, $email]);
                if ($chk->fetch()) {
                    $error = 'Ese usuario o correo ya está registrado.';
                } else {
                    // First registered user becomes admin automatically
                    $countUsers = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
                    $role = $countUsers === 0 ? 'admin' : 'user';
                    $hash = password_hash($password, PASSWORD_DEFAULT);

                    $ins = $pdo->prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
                    $ins->execute([$username, $email, $hash, $role]);
                    $newId = (int)$pdo->lastInsertId();

                    loginUser([
                        'id' => $newId,
                        'username' => $username,
                        'email' => $email,
                        'role' => $role,
                    ]);
                    header('Location: /panel');
                    exit;
                }
            }
        } else {
            $login = trim((string)($_POST['login'] ?? ''));
            $password = (string)($_POST['password'] ?? '');
            $stmt = $pdo->prepare('SELECT id, username, email, password_hash, role FROM users WHERE email = ? OR username = ? LIMIT 1');
            $stmt->execute([strtolower($login), $login]);
            $u = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$u || !password_verify($password, $u['password_hash'])) {
                $error = 'Usuario/correo o contraseña incorrectos.';
            } else {
                loginUser($u);
                header('Location: /panel');
                exit;
            }
        }
    }
}
$token = csrfToken();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cuenta — CompareAmazon</title>
  <link rel="stylesheet" href="/assets/landing.css" />
  <style>
    .auth-wrap { max-width:430px; margin:56px auto; padding:28px; border:1px solid var(--border); border-radius:16px; background:#fff; box-shadow:0 14px 36px rgba(15,23,42,.08); }
    .auth-tabs { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px; }
    .auth-tab { text-align:center; padding:9px; border-radius:9px; font-weight:700; font-size:14px; text-decoration:none; color:var(--muted); border:1px solid var(--border); }
    .auth-tab.active { background:var(--primary-soft); color:var(--primary); border-color:var(--primary); }
    .form-field { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
    .form-field label { font-size:13px; font-weight:600; }
    .form-field input { padding:10px 12px; border-radius:9px; border:1px solid var(--border); font-size:14px; }
    .err-box { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; padding:10px 12px; border-radius:9px; font-size:13px; margin-bottom:14px; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <a href="/" class="logo"><span class="logo-mark">🛒</span><span>CompareAmazon</span></a>
      <div class="nav-links">
        <a href="/explorar">Explorar</a>
        <a href="/">Inicio</a>
      </div>
    </div>
  </nav>

  <main class="container">
    <div class="auth-wrap">
      <div class="auth-tabs">
        <a href="/cuenta?mode=login" class="auth-tab <?= $mode === 'login' ? 'active' : '' ?>">Iniciar sesión</a>
        <a href="/cuenta?mode=register" class="auth-tab <?= $mode === 'register' ? 'active' : '' ?>">Crear cuenta</a>
      </div>

      <?php if ($error !== ''): ?>
        <div class="err-box"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>

      <form method="post" action="/cuenta?mode=<?= $mode ?>">
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>" />
        <input type="hidden" name="mode" value="<?= $mode ?>" />

        <?php if ($mode === 'register'): ?>
          <div class="form-field">
            <label for="username">Nombre de usuario</label>
            <input id="username" name="username" type="text" required minlength="3" maxlength="30" placeholder="ej. bruno" />
          </div>
          <div class="form-field">
            <label for="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required placeholder="tu@correo.com" />
          </div>
        <?php else: ?>
          <div class="form-field">
            <label for="login">Usuario o correo</label>
            <input id="login" name="login" type="text" required placeholder="tu@correo.com" />
          </div>
        <?php endif; ?>

        <div class="form-field">
          <label for="password">Contraseña</label>
          <input id="password" name="password" type="password" required minlength="6" placeholder="••••••" />
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width:100%; border:none;">
          <?= $mode === 'register' ? 'Crear cuenta gratis' : 'Entrar al panel' ?>
        </button>
      </form>
    </div>
  </main>
</body>
</html>
