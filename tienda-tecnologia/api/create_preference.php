<?php
/**
 * Crea una preferencia de pago de Mercado Pago (Checkout Pro) a partir del
 * carrito recibido y devuelve la URL de pago (init_point).
 *
 * Seguridad: los precios NUNCA se toman del navegador. Se recalculan acá
 * leyendo data/products.json, así nadie puede alterar el total editando el
 * JavaScript del sitio.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function fail(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Método no permitido.');
}

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    fail(500, 'Falta configurar api/config.php (copiá api/config.example.php).');
}
$config = require $configPath;

if (empty($config['mp_access_token']) || str_starts_with($config['mp_access_token'], 'TEST-0000000000000000')) {
    fail(500, 'Configurá tu Access Token real de Mercado Pago en api/config.php.');
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body) || empty($body['items']) || !is_array($body['items'])) {
    fail(400, 'El carrito está vacío o es inválido.');
}

$catalogPath = __DIR__ . '/../data/products.json';
$catalog = json_decode(file_get_contents($catalogPath), true);
if (!$catalog || empty($catalog['products'])) {
    fail(500, 'No se pudo leer el catálogo de productos.');
}

$productsById = [];
foreach ($catalog['products'] as $p) {
    $productsById[$p['id']] = $p;
}

$items = [];
foreach ($body['items'] as $entry) {
    $id = $entry['id'] ?? null;
    $qty = (int)($entry['quantity'] ?? 0);

    if (!$id || !isset($productsById[$id])) {
        fail(400, "Producto inválido: {$id}");
    }
    if ($qty < 1) {
        fail(400, 'Cantidad inválida.');
    }

    $product = $productsById[$id];
    if ($qty > (int)$product['stock']) {
        fail(409, "No hay suficiente stock de \"{$product['name']}\".");
    }

    $items[] = [
        'id'          => $product['id'],
        'title'       => $product['name'],
        'description' => $product['description'] ?? '',
        'quantity'    => $qty,
        'currency_id' => $catalog['currency'] ?? 'ARS',
        'unit_price'  => (float)$product['price'],
    ];
}

if (empty($items)) {
    fail(400, 'El carrito está vacío.');
}

$siteUrl = rtrim($config['site_url'], '/');

$preference = [
    'items' => $items,
    'back_urls' => [
        'success' => $siteUrl . '/pago-exitoso.html',
        'pending' => $siteUrl . '/pago-pendiente.html',
        'failure' => $siteUrl . '/pago-fallido.html',
    ],
    'auto_return' => 'approved',
    'notification_url' => $siteUrl . '/api/webhook.php',
    'statement_descriptor' => 'NOVA TECH',
];

$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $config['mp_access_token'],
    ],
    CURLOPT_POSTFIELDS => json_encode($preference),
    CURLOPT_TIMEOUT => 15,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    fail(502, 'No se pudo conectar con Mercado Pago: ' . $curlError);
}

$result = json_decode($response, true);

if ($httpCode >= 400) {
    $message = $result['message'] ?? 'Mercado Pago rechazó la solicitud.';
    fail(502, $message);
}

echo json_encode([
    'init_point' => $result['init_point'] ?? null,
    'sandbox_init_point' => $result['sandbox_init_point'] ?? null,
    'preference_id' => $result['id'] ?? null,
]);
