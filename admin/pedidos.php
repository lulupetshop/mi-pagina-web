<?php
declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

lulu_admin_requerir('Pedidos');

$ESTADO_LABEL = [
    'aprobado' => 'Aprobado',
    'pendiente' => 'Pendiente',
    'enviado' => 'Enviado por WhatsApp',
    'rechazado' => 'Rechazado',
    'cancelado' => 'Cancelado',
    'reembolsado' => 'Reembolsado',
    'contracargo' => 'Contracargo',
];
$CANAL_LABEL = [
    'mercadopago' => '💳 Mercado Pago',
    'whatsapp' => '💬 WhatsApp',
    'meta' => '📸 Instagram/Facebook',
];

$pdo = lulu_db();
$pedidos = $pdo->query(
    'SELECT id, canal, estado, modo, nombre, telefono, entrega, direccion, localidad, observaciones, items, total, creado_en
     FROM pedidos
     ORDER BY creado_en DESC'
)->fetchAll();

$PERIODOS = ['7' => 'Últimos 7 días', '30' => 'Últimos 30 días', 'todo' => 'Todo'];
$periodo = $_GET['periodo'] ?? '30';
if (!isset($PERIODOS[$periodo])) {
    $periodo = '30';
}

$desde = null;
if ($periodo !== 'todo') {
    $desde = (new DateTime())->modify("-{$periodo} days");
}

$totalGanado = 0;
$cantidadAprobados = 0;
$cantidadWhatsapp = 0;
foreach ($pedidos as $p) {
    if ($desde !== null && new DateTime($p['creado_en']) < $desde) {
        continue;
    }
    if ($p['estado'] === 'aprobado') {
        $totalGanado += (float) $p['total'];
        $cantidadAprobados++;
    }
    if ($p['canal'] === 'whatsapp') {
        $cantidadWhatsapp++;
    }
}
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
    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
      <h1>📦 Pedidos</h1>
      <a href="agregar-pedido.php" class="btn-agregar">+ Cargar pedido manual</a>
    </div>
    <p class="sub">Más recientes primero. Incluye Mercado Pago, WhatsApp, y lo que cargues a mano (Instagram/Facebook).</p>

    <div class="card resumen">
      <div class="resumen__filtros">
        <?php foreach ($PERIODOS as $valor => $label): ?>
          <a href="?periodo=<?= $valor ?>" class="filtro<?= (string) $valor === $periodo ? ' filtro--activo' : '' ?>"><?= htmlspecialchars($label) ?></a>
        <?php endforeach; ?>
      </div>
      <div class="resumen__total">$ <?= number_format($totalGanado, 0, ',', '.') ?></div>
      <p class="resumen__detalle">
        <?= $cantidadAprobados ?> pedido<?= $cantidadAprobados === 1 ? '' : 's' ?> aprobado<?= $cantidadAprobados === 1 ? '' : 's' ?> por Mercado Pago · <?= htmlspecialchars($PERIODOS[$periodo]) ?>
      </p>
      <p class="resumen__detalle resumen__detalle--wa">
        💬 <?= $cantidadWhatsapp ?> pedido<?= $cantidadWhatsapp === 1 ? '' : 's' ?> por WhatsApp en el mismo período (no incluidos en el total: el pago se coordina aparte, no siempre se confirma acá).
      </p>
    </div>

    <div class="card">
      <?php if (!$pedidos): ?>
        <p class="vacio">Todavía no hay pedidos.</p>
      <?php else: ?>
        <table>
          <thead>
            <tr><th>Fecha</th><th>Canal</th><th>Cliente</th><th>Entrega</th><th>Items</th><th>Total</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <?php foreach ($pedidos as $p):
              $fecha = new DateTime($p['creado_en']);
              $items = json_decode($p['items'], true) ?: [];
              // Los pedidos cargados a mano (Instagram/Facebook) guardan la
              // descripción tal cual se escribió, sin producto de catálogo
              // (productId null): se muestra como vino, sin el prefijo
              // "1x" que sí corresponde a los ítems reales del carrito.
              $detalleItems = implode(', ', array_map(
                  fn($it) => ($it['productId'] ?? null) === null
                      ? $it['nombre']
                      : "{$it['cantidad']}x {$it['nombre']}" . ($it['colorNombre'] ? " ({$it['colorNombre']})" : ''),
                  $items
              ));
              $entregaTexto = $p['entrega'] === 'envio'
                  ? htmlspecialchars($p['direccion'] . ', ' . $p['localidad'])
                  : 'Retira en el local';
              $badgeClass = 'badge badge--' . $p['estado'];
              $badgeLabel = $ESTADO_LABEL[$p['estado']] ?? $p['estado'];
              $canalLabel = $CANAL_LABEL[$p['canal']] ?? $p['canal'];
            ?>
              <tr>
                <td><?= $fecha->format('d/m/Y H:i') ?></td>
                <td><?= htmlspecialchars($canalLabel) ?></td>
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
