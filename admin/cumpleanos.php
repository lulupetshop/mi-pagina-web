<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/mp/db.php';
require_once __DIR__ . '/../api/auth/sesion_helper.php';

lulu_iniciar_sesion();

if (isset($_GET['salir'])) {
    unset($_SESSION['admin_ok']);
    header('Location: cumpleanos.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $config = lulu_config();
    $intento = (string) ($_POST['password'] ?? '');
    if (hash_equals((string) $config['admin_password'], $intento) && $intento !== 'CAMBIAR_ESTA_CONTRASEÑA') {
        $_SESSION['admin_ok'] = true;
    } else {
        $error = 'Contraseña incorrecta.';
    }
}

$autenticado = !empty($_SESSION['admin_ok']);

function lulu_dias_hasta_cumple(string $fechaNacimiento): int
{
    $hoy = new DateTime('today');
    $partes = explode('-', $fechaNacimiento);
    $mes = $partes[1] ?? '01';
    $dia = $partes[2] ?? '01';
    $cumpleEsteAnio = DateTime::createFromFormat('Y-m-d', $hoy->format('Y') . "-{$mes}-{$dia}");
    if (!$cumpleEsteAnio) {
        return 9999;
    }
    $cumpleEsteAnio->setTime(0, 0);
    if ($cumpleEsteAnio < $hoy) {
        $cumpleEsteAnio->modify('+1 year');
    }
    return (int) $hoy->diff($cumpleEsteAnio)->days;
}

function lulu_texto_dias(int $dias): string
{
    if ($dias === 0) return '¡Hoy! 🎉';
    if ($dias === 1) return 'Mañana';
    return "En {$dias} días";
}

$mascotas = [];
if ($autenticado) {
    $pdo = lulu_db();
    $stmt = $pdo->query(
        'SELECT m.nombre, m.tipo, m.fecha_nacimiento, u.email
         FROM mascotas m
         JOIN usuarios u ON u.id = m.usuario_id
         WHERE m.fecha_nacimiento IS NOT NULL'
    );
    $mascotas = $stmt->fetchAll();
    foreach ($mascotas as &$m) {
        $m['dias'] = lulu_dias_hasta_cumple($m['fecha_nacimiento']);
    }
    unset($m);
    usort($mascotas, fn($a, $b) => $a['dias'] <=> $b['dias']);
}
?>
<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Cumpleaños de mascotas | Lulú Lulú</title>
  <style>
    body{ font-family: Arial, Helvetica, sans-serif; background:#f7f3fb; color:#241539; margin:0; padding:32px 16px; }
    .wrap{ max-width: 720px; margin: 0 auto; }
    h1{ font-size: 1.5rem; margin-bottom: 4px; }
    .sub{ color:#6b6178; margin-bottom: 24px; }
    .card{ background:#fff; border-radius:16px; padding:24px; box-shadow: 0 10px 30px rgba(36,21,57,.08); }
    form{ display:flex; flex-direction:column; gap:12px; max-width: 320px; }
    input[type=password]{ padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; font-size: 1rem; }
    button{ padding: 10px 16px; border-radius: 999px; border: 0; background:#7c46bf; color:#fff; font-weight:700; cursor:pointer; }
    .error{ color:#b3261e; font-size:.9rem; }
    table{ width:100%; border-collapse: collapse; margin-top: 8px; }
    th, td{ text-align:left; padding: 10px 8px; border-bottom: 1px solid #eee; font-size:.92rem; }
    th{ color:#6b6178; font-weight:600; font-size:.78rem; text-transform:uppercase; }
    tr.pronto td{ background:#fff3e9; font-weight:700; }
    .logout{ float:right; font-size:.85rem; color:#6b6178; text-decoration:none; }
    .vacio{ color:#6b6178; padding: 16px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <?php if (!$autenticado): ?>
      <h1>🐾 Cumpleaños de mascotas</h1>
      <p class="sub">Ingresá la contraseña para ver el panel.</p>
      <div class="card">
        <form method="post">
          <input type="password" name="password" placeholder="Contraseña" autofocus required>
          <?php if ($error): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
          <button type="submit">Entrar</button>
        </form>
      </div>
    <?php else: ?>
      <a class="logout" href="?salir=1">Cerrar sesión</a>
      <h1>🐾 Cumpleaños de mascotas</h1>
      <p class="sub">Ordenado por el más próximo. Se resaltan los que cumplen en los próximos 7 días.</p>
      <div class="card">
        <?php if (!$mascotas): ?>
          <p class="vacio">Todavía no hay mascotas con fecha de nacimiento cargada.</p>
        <?php else: ?>
          <table>
            <thead>
              <tr><th>Mascota</th><th>Tipo</th><th>Nace</th><th>Dueño</th><th>Cumple</th></tr>
            </thead>
            <tbody>
              <?php foreach ($mascotas as $m):
                $fecha = DateTime::createFromFormat('Y-m-d', $m['fecha_nacimiento']);
                $tipoLabel = ['perro' => 'Perro', 'gato' => 'Gato', 'otro' => 'Otro'][$m['tipo']] ?? $m['tipo'];
              ?>
                <tr class="<?= $m['dias'] <= 7 ? 'pronto' : '' ?>">
                  <td><?= htmlspecialchars($m['nombre']) ?></td>
                  <td><?= htmlspecialchars($tipoLabel) ?></td>
                  <td><?= $fecha ? $fecha->format('d/m/Y') : '—' ?></td>
                  <td><?= htmlspecialchars($m['email']) ?></td>
                  <td><?= lulu_texto_dias($m['dias']) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        <?php endif; ?>
      </div>
    <?php endif; ?>
  </div>
</body>
</html>
