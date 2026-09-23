<?php
declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

lulu_admin_requerir('Cumpleaños de mascotas');

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
?>
<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Cumpleaños de mascotas | Lulú Lulú</title>
  <style><?= lulu_admin_css() ?></style>
</head>
<body>
  <div class="wrap">
    <?php lulu_admin_nav('cumpleanos.php'); ?>
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
  </div>
</body>
</html>
