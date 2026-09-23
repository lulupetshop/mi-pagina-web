<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/mp/db.php';
require_once __DIR__ . '/../api/auth/sesion_helper.php';

/**
 * Gate compartido por las páginas de admin/. Si no hay sesión de admin
 * válida, muestra el formulario de contraseña y corta la ejecución (las
 * páginas que llaman a esto pueden asumir que, si vuelve, ya hay sesión).
 */
function lulu_admin_requerir(string $titulo): void
{
    lulu_iniciar_sesion();

    if (isset($_GET['salir'])) {
        unset($_SESSION['admin_ok']);
        header('Location: ' . basename($_SERVER['SCRIPT_NAME']));
        exit;
    }

    $error = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
        $config = lulu_config();
        $intento = (string) $_POST['password'];
        if (hash_equals((string) ($config['admin_password'] ?? ''), $intento) && $intento !== 'CAMBIAR_ESTA_CONTRASEÑA') {
            $_SESSION['admin_ok'] = true;
        } else {
            $error = 'Contraseña incorrecta.';
        }
    }

    if (!empty($_SESSION['admin_ok'])) {
        return;
    }
    ?>
    <!DOCTYPE html>
    <html lang="es-AR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="robots" content="noindex">
      <title><?= htmlspecialchars($titulo) ?> | Lulú Lulú</title>
      <style><?= lulu_admin_css() ?></style>
    </head>
    <body>
      <div class="wrap">
        <h1>🐾 <?= htmlspecialchars($titulo) ?></h1>
        <p class="sub">Ingresá la contraseña para ver el panel.</p>
        <div class="card">
          <form method="post">
            <input type="password" name="password" placeholder="Contraseña" autofocus required>
            <?php if ($error): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </body>
    </html>
    <?php
    exit;
}

function lulu_admin_css(): string
{
    return "
    body{ font-family: Arial, Helvetica, sans-serif; background:#f7f3fb; color:#241539; margin:0; padding:32px 16px; }
    .wrap{ max-width: 880px; margin: 0 auto; }
    h1{ font-size: 1.5rem; margin-bottom: 4px; }
    .sub{ color:#6b6178; margin-bottom: 24px; }
    .card{ background:#fff; border-radius:16px; padding:24px; box-shadow: 0 10px 30px rgba(36,21,57,.08); }
    form{ display:flex; flex-direction:column; gap:12px; max-width: 320px; }
    input[type=password]{ padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; font-size: 1rem; }
    button{ padding: 10px 16px; border-radius: 999px; border: 0; background:#7c46bf; color:#fff; font-weight:700; cursor:pointer; }
    .error{ color:#b3261e; font-size:.9rem; }
    table{ width:100%; border-collapse: collapse; margin-top: 8px; }
    th, td{ text-align:left; padding: 10px 8px; border-bottom: 1px solid #eee; font-size:.88rem; vertical-align: top; }
    th{ color:#6b6178; font-weight:600; font-size:.75rem; text-transform:uppercase; }
    tr.pronto td{ background:#fff3e9; font-weight:700; }
    .logout{ float:right; font-size:.85rem; color:#6b6178; text-decoration:none; }
    .vacio{ color:#6b6178; padding: 16px 0; }
    .badge{ display:inline-block; font-size:.68rem; font-weight:800; padding:.35em .8em; border-radius:999px; text-transform:uppercase; white-space:nowrap; }
    .badge--aprobado{ background:#e3f7ea; color:#1f8a4c; }
    .badge--pendiente{ background:#f3ecfb; color:#7c46bf; }
    .badge--rechazado, .badge--cancelado{ background:#fdece3; color:#c1440e; }
    .badge--reembolsado, .badge--contracargo{ background:#fdece3; color:#c1440e; }
    .nav-admin{ display:flex; gap:16px; margin-bottom: 18px; font-size:.85rem; }
    .nav-admin a{ color:#7c46bf; text-decoration:none; font-weight:700; }
    .items{ font-size:.82rem; color:#4a4257; }
    ";
}

function lulu_admin_nav(string $actual): void
{
    $paginas = ['pedidos.php' => 'Pedidos', 'cumpleanos.php' => 'Cumpleaños'];
    echo '<a class="logout" href="?salir=1">Cerrar sesión</a>';
    echo '<nav class="nav-admin">';
    foreach ($paginas as $href => $label) {
        echo $href === $actual
            ? '<span>' . htmlspecialchars($label) . '</span>'
            : '<a href="' . htmlspecialchars($href) . '">' . htmlspecialchars($label) . '</a>';
    }
    echo '</nav>';
}
