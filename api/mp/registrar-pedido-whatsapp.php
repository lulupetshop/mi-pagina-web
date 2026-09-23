<?php
declare(strict_types=1);

require __DIR__ . '/db.php';
require __DIR__ . '/calcular_pedido.php';
require __DIR__ . '/../auth/sesion_helper.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lulu_error('Método no permitido.', 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    lulu_error('Pedido inválido.');
}

$pedido = lulu_validar_y_calcular_pedido($body);
$usuarioId = lulu_usuario_actual();

$pdo = lulu_db();
$stmt = $pdo->prepare(
    'INSERT INTO pedidos
        (usuario_id, canal, estado, modo, nombre, telefono, entrega, direccion, localidad, observaciones, items, subtotal, descuento, descuento_segunda, total, creado_en)
     VALUES
        (?, "whatsapp", "enviado", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
);
$stmt->execute([
    $usuarioId,
    $pedido['modo'], $pedido['nombre'], $pedido['telefono'], $pedido['entrega'],
    $pedido['direccion'], $pedido['localidad'], $pedido['observaciones'],
    json_encode($pedido['items'], JSON_UNESCAPED_UNICODE),
    $pedido['subtotal'], $pedido['descuento'], $pedido['descuentoSegunda'], $pedido['total'],
]);

echo json_encode(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);
