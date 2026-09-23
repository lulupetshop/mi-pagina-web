<?php
declare(strict_types=1);

require_once __DIR__ . '/sesion_helper.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}

$usuarioId = lulu_requerir_sesion();
$pdo = lulu_db();

$stmt = $pdo->prepare(
    'SELECT id, estado, modo, items, total, creado_en
     FROM pedidos
     WHERE usuario_id = ?
     ORDER BY creado_en DESC'
);
$stmt->execute([$usuarioId]);
$pedidos = $stmt->fetchAll();

foreach ($pedidos as &$pedido) {
    $pedido['items'] = json_decode($pedido['items'], true) ?: [];
}
unset($pedido);

echo json_encode(['ok' => true, 'pedidos' => $pedidos]);
