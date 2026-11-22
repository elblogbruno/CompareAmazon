<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/private/auth.php';
logoutUser();
header('Location: /');
exit;
