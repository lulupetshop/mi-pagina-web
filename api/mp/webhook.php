<?php
declare(strict_types=1);

require __DIR__ . '/db.php';
require __DIR__ . '/whatsapp.php';

header('Content-Type: application/json; charset=utf-8');

// Mercado Pago avisa por query string (?type=payment&data.id=123) y,
// según la integración, también puede mandar el mismo dato en el body
// JSON. Contemplamos los dos casos.
$type = $_GET['type'] ?? $_GET['topic'] ?? null;
$paymentId = $_GET['data_id'] ?? $_GET['id'] ?? null;

if (!$paymentId) {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    if (is_array($body)) {
        $type = $body['type'] ?? $type;
        $paymentId = $body['data']['id'] ?? $paymentId;
    }
}

// Solo nos interesan los avisos de pagos. Respondemos 200 igual al resto
// (merchant_order, etc.) para que Mercado Pago no reintente en vano.
if ($type !== 'payment' || !$paymentId) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'skipped' => true]);
    exit;
}

$config = lulu_config();

// No confiamos en el estado que venga en el aviso: volvemos a pedirle a
// Mercado Pago el pago real con nuestro propio token, así nadie puede
// falsificar un webhook para marcar un pedido como pagado.
$ch = curl_init('https://api.mercadopago.com/v1/payments/' . urlencode((string) $paymentId));
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer {$config['mp_access_token']}"],
    CURLOPT_TIMEOUT => 10,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    http_response_code(200);
    echo json_encode(['ok' => false, 'error' => 'No se pudo consultar el pago en Mercado Pago.']);
    exit;
}

$pago = json_decode($response, true);
$pedidoId = $pago['external_reference'] ?? null;
$estadoMp = $pago['status'] ?? null; // approved | pending | in_process | rejected | cancelled | refunded | charged_back

$mapaEstados = [
    'approved' => 'aprobado',
    'pending' => 'pendiente',
    'in_process' => 'pendiente',
    'rejected' => 'rechazado',
    'cancelled' => 'cancelado',
    'refunded' => 'reembolsado',
    'charged_back' => 'contracargo',
];
$estado = $mapaEstados[$estadoMp] ?? 'pendiente';

if ($pedidoId && ctype_digit((string) $pedidoId)) {
    $pdo = lulu_db();

    $stmt = $pdo->prepare('SELECT estado, nombre, telefono FROM pedidos WHERE id = ?');
    $stmt->execute([(int) $pedidoId]);
    $pedidoPrevio = $stmt->fetch();

    $stmt = $pdo->prepare('UPDATE pedidos SET estado = ?, mp_payment_id = ?, actualizado_en = NOW() WHERE id = ?');
    $stmt->execute([$estado, (string) $paymentId, (int) $pedidoId]);

    // Mercado Pago puede reenviar el mismo aviso más de una vez: solo
    // mandamos el WhatsApp la primera vez que el pedido pasa a aprobado,
    // no en cada reintento del webhook.
    if ($pedidoPrevio && $pedidoPrevio['estado'] !== 'aprobado' && $estado === 'aprobado') {
        lulu_enviar_whatsapp_confirmacion([
            'id' => $pedidoId,
            'nombre' => $pedidoPrevio['nombre'],
            'telefono' => $pedidoPrevio['telefono'],
        ]);
    }
}

http_response_code(200);
echo json_encode(['ok' => true]);
