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
        (?, "mercadopago", "pendiente", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
);
$stmt->execute([
    $usuarioId,
    $pedido['modo'], $pedido['nombre'], $pedido['telefono'], $pedido['entrega'],
    $pedido['direccion'], $pedido['localidad'], $pedido['observaciones'],
    json_encode($pedido['items'], JSON_UNESCAPED_UNICODE),
    $pedido['subtotal'], $pedido['descuento'], $pedido['descuentoSegunda'], $pedido['total'],
]);
$pedidoId = (int) $pdo->lastInsertId();

$config = lulu_config();
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'lulutiendaparamascotas.shop';
$base = "{$scheme}://{$host}";

$descripcionItems = implode(', ', array_map(
    static fn(array $it): string => "{$it['cantidad']}x {$it['nombre']}",
    $pedido['items']
));

$preferencia = [
    'items' => [[
        'title' => 'Pedido Lulú Lulú #' . $pedidoId,
        'description' => mb_substr($descripcionItems, 0, 250),
        'quantity' => 1,
        'unit_price' => (float) $pedido['total'],
        'currency_id' => 'ARS',
    ]],
    'payer' => ['name' => $pedido['nombre']],
    'external_reference' => (string) $pedidoId,
    'back_urls' => [
        'success' => "{$base}/index.html?pago=exito",
        'failure' => "{$base}/index.html?pago=fallo",
        'pending' => "{$base}/index.html?pago=pendiente",
    ],
    'auto_return' => 'approved',
    'notification_url' => "{$base}/api/mp/webhook.php",
    'statement_descriptor' => 'LULU LULU',
];

$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        "Authorization: Bearer {$config['mp_access_token']}",
    ],
    CURLOPT_POSTFIELDS => json_encode($preferencia, JSON_UNESCAPED_UNICODE),
    CURLOPT_TIMEOUT => 15,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode < 200 || $httpCode >= 300) {
    lulu_error('No se pudo iniciar el pago con Mercado Pago. Probá de nuevo en un momento.', 502);
}

$data = json_decode((string) $response, true);
$preferenceId = $data['id'] ?? null;
// Mercado Pago distingue prueba de producción por las credenciales usadas
// para crear la preferencia, no por una URL de sandbox aparte: hay que
// usar siempre init_point (sandbox_init_point puede venir roto en cuentas
// con el modelo de credenciales unificado).
$redirectUrl = $data['init_point'] ?? $data['sandbox_init_point'] ?? null;

if (!$preferenceId || !$redirectUrl) {
    lulu_error('Mercado Pago no devolvió un link de pago válido.', 502);
}

$stmt = $pdo->prepare('UPDATE pedidos SET mp_preference_id = ? WHERE id = ?');
$stmt->execute([$preferenceId, $pedidoId]);

echo json_encode(['ok' => true, 'redirect' => $redirectUrl]);
