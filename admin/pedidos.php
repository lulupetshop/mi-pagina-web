<?php
declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

lulu_admin_requerir('Pedidos');

$ESTADO_LABEL = [
    'aprobado' => 'Aprobado',
    'pendiente' => 'Pendiente',
    'rechazado' => 'Rechazado',
    'cancelado' => 'Cancelado',
    'reembolsado' => 'Reembolsado',
    'contracargo' => 'Contracargo',
];

$pdo = lulu_db();
$pedidos = $pdo->query(
    'SELECT id, estado, modo, nombre, telefono, entrega, direccion, localidad, observaciones, items, total, creado_en
     FROM pedidos
     ORDER BY creado_en DESC'
)->fetchAll();
?>
<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Pedidos | Lulú Lulú</title>
  <style><?= lulu_admin_css() ?></style>
</head>
<body>
  <div class="wrap">
    <?php lulu_admin_nav('pedidos.php'); ?>
    <h1>📦 Pedidos pagados con Mercado Pago</h1>
    <p class="sub">Más recientes primero. Los pedidos por WhatsApp no aparecen acá (esos ya te llegan directo por chat).</p>
    <div class="card">
      <?php if (!$pedidos): ?>
        <p class="vacio">Todavía no hay pedidos.</p>
      <?php else: ?>
        <table>
          <thead>
            <tr><th>Fecha</th><th>Cliente</th><th>Entrega</th><th>Items</th><th>Total</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <?php foreach ($pedidos as $p):
              $fecha = new DateTime($p['creado_en']);
              $items = json_decode($p['items'], true) ?: [];
              $detalleItems = implode(', ', array_map(
                  fn($it) => "{$it['cantidad']}x {$it['nombre']}" . ($it['colorNombre'] ? " ({$it['colorNombre']})" : ''),
                  $items
              ));
              $entregaTexto = $p['entrega'] === 'envio'
                  ? htmlspecialchars($p['direccion'] . ', ' . $p['localidad'])
                  : 'Retira en el local';
              $badgeClass = 'badge badge--' . $p['estado'];
              $badgeLabel = $ESTADO_LABEL[$p['estado']] ?? $p['estado'];
            ?>
              <tr>
                <td><?= $fecha->format('d/m/Y H:i') ?></td>
                <td><b><?= htmlspecialchars($p['nombre']) ?></b><br><?= htmlspecialchars($p['telefono']) ?></td>
                <td><?= $entregaTexto ?><?php if ($p['observaciones']): ?><br><em><?= htmlspecialchars($p['observaciones']) ?></em><?php endif; ?></td>
                <td class="items"><?= htmlspecialchars($detalleItems) ?><?php if ($p['modo'] === 'mayorista'): ?><br><b>Mayorista</b><?php endif; ?></td>
                <td><b>$ <?= number_format((float) $p['total'], 0, ',', '.') ?></b></td>
                <td><span class="<?= htmlspecialchars($badgeClass) ?>"><?= htmlspecialchars($badgeLabel) ?></span></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>
