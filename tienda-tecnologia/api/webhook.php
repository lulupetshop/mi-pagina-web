<?php
/**
 * Webhook de Mercado Pago: se llama automáticamente cuando cambia el estado
 * de un pago. Acá solo lo registramos en api/orders.log para que puedas
 * revisar los pagos recibidos (no hay base de datos en este sitio estático).
 *
 * Configurá esta URL como "notification_url" (ya se envía automáticamente
 * desde create_preference.php) o en el panel de tu aplicación de Mercado Pago.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(200); // igual respondemos 200 para que MP no reintente indefinidamente
    echo json_encode(['ok' => false, 'reason' => 'config missing']);
    exit;
}
$config = require $configPath;

$paymentId = $_GET['data_id'] ?? $_GET['id'] ?? null;
$topic = $_GET['type'] ?? $_GET['topic'] ?? null;

$logLine = [
    'date' => date('c'),
    'topic' => $topic,
    'payment_id' => $paymentId,
];

if ($paymentId && $topic === 'payment') {
    $ch = curl_init("https://api.mercadopago.com/v1/payments/{$paymentId}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $config['mp_access_token']],
        CURLOPT_TIMEOUT => 10,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    $payment = json_decode((string)$response, true);
    if (is_array($payment)) {
        $logLine['status'] = $payment['status'] ?? null;
        $logLine['status_detail'] = $payment['status_detail'] ?? null;
        $logLine['amount'] = $payment['transaction_amount'] ?? null;
        $logLine['payer_email'] = $payment['payer']['email'] ?? null;
    }
}

file_put_contents(__DIR__ . '/orders.log', json_encode($logLine) . PHP_EOL, FILE_APPEND | LOCK_EX);

http_response_code(200);
echo json_encode(['ok' => true]);
