<?php
declare(strict_types=1);

require __DIR__ . '/db.php';
require __DIR__ . '/productos.php';

header('Content-Type: application/json; charset=utf-8');

function lulu_error(string $msg, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lulu_error('Método no permitido.', 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    lulu_error('Pedido inválido.');
}

$cart = $body['cart'] ?? null;
$cliente = $body['cliente'] ?? null;
$modo = $body['modo'] ?? 'minorista';
$promoAplicada = !empty($body['promoAplicada']);

if (!is_array($cart) || count($cart) === 0) {
    lulu_error('El carrito está vacío.');
}
if (!in_array($modo, ['minorista', 'mayorista'], true)) {
    lulu_error('Modo de compra inválido.');
}
if (!is_array($cliente)) {
    lulu_error('Faltan los datos del cliente.');
}

$nombre = trim((string) ($cliente['nombre'] ?? ''));
$telefono = trim((string) ($cliente['telefono'] ?? ''));
$entrega = ($cliente['entrega'] ?? '') === 'envio' ? 'envio' : 'retiro';
$direccion = trim((string) ($cliente['direccion'] ?? ''));
$localidad = trim((string) ($cliente['localidad'] ?? ''));
$observaciones = trim((string) ($cliente['observaciones'] ?? ''));

if ($nombre === '' || mb_strlen($nombre) > 80) {
    lulu_error('Nombre inválido.');
}
if ($telefono === '' || mb_strlen($telefono) > 24) {
    lulu_error('Teléfono inválido.');
}
if ($entrega === 'envio' && ($direccion === '' || $localidad === '')) {
    lulu_error('Faltan los datos de envío.');
}
if (mb_strlen($direccion) > 120 || mb_strlen($localidad) > 80 || mb_strlen($observaciones) > 400) {
    lulu_error('Alguno de los datos es demasiado largo.');
}

$catalogo = lulu_productos();
$items = [];
$subtotal = 0;
$unidadesPrecio = [];
$totalUnidades = 0;

foreach ($cart as $linea) {
    if (!is_array($linea)) {
        lulu_error('Hay un producto inválido en el carrito.');
    }
    $productId = (string) ($linea['productId'] ?? '');
    $cantidad = (int) ($linea['cantidad'] ?? 0);
    if ($cantidad < 1 || $cantidad > 50 || !isset($catalogo[$productId])) {
        lulu_error('Hay un producto inválido en el carrito.');
    }
    $producto = $catalogo[$productId];
    $precioUnitario = $modo === 'mayorista' ? $producto['mayorista'] : $producto['minorista'];
    $subtotal += $precioUnitario * $cantidad;
    $totalUnidades += $cantidad;
    for ($i = 0; $i < $cantidad; $i++) {
        $unidadesPrecio[] = $precioUnitario;
    }
    $items[] = [
        'productId' => $productId,
        'nombre' => $producto['nombre'],
        'cantidad' => $cantidad,
        'precioUnitario' => $precioUnitario,
        'colorNombre' => isset($linea['colorNombre']) ? (string) $linea['colorNombre'] : null,
        'talle' => isset($linea['talle']) ? (string) $linea['talle'] : null,
    ];
}

// Mismo mínimo mayorista que MAYORISTA_MIN_UNIDADES en js/config.js.
$MAYORISTA_MIN_UNIDADES = 10;
if ($modo === 'mayorista' && $totalUnidades < $MAYORISTA_MIN_UNIDADES) {
    lulu_error("La compra mayorista requiere al menos {$MAYORISTA_MIN_UNIDADES} unidades.");
}

// Mismos porcentajes que PRIMERA_COMPRA y SEGUNDA_UNIDAD en js/config.js.
// La elegibilidad de "primera compra" la marca el navegador (no hay
// cuentas de usuario en el sitio); acá solo se valida que los PRECIOS
// sean los reales antes de cobrar.
$descuento = 0;
if ($modo !== 'mayorista' && $promoAplicada) {
    $descuento = (int) round($subtotal * 0.15);
}

$descuentoSegunda = 0;
if ($modo !== 'mayorista' && count($unidadesPrecio) >= 2) {
    sort($unidadesPrecio);
    $descuentoSegunda = (int) round($unidadesPrecio[0] * 0.50);
}

$total = max(0, $subtotal - $descuento - $descuentoSegunda);
if ($total < 1) {
    lulu_error('El total del pedido no puede ser $0.');
}

$pdo = lulu_db();
$stmt = $pdo->prepare(
    'INSERT INTO pedidos
        (estado, modo, nombre, telefono, entrega, direccion, localidad, observaciones, items, subtotal, descuento, descuento_segunda, total, creado_en)
     VALUES
        ("pendiente", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
);
$stmt->execute([
    $modo, $nombre, $telefono, $entrega, $direccion, $localidad, $observaciones,
    json_encode($items, JSON_UNESCAPED_UNICODE),
    $subtotal, $descuento, $descuentoSegunda, $total,
]);
$pedidoId = (int) $pdo->lastInsertId();

$config = lulu_config();
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'lulutiendaparamascotas.shop';
$base = "{$scheme}://{$host}";

$descripcionItems = implode(', ', array_map(
    static fn(array $it): string => "{$it['cantidad']}x {$it['nombre']}",
    $items
));

$preferencia = [
    'items' => [[
        'title' => 'Pedido Lulú Lulú #' . $pedidoId,
        'description' => mb_substr($descripcionItems, 0, 250),
        'quantity' => 1,
        'unit_price' => (float) $total,
        'currency_id' => 'ARS',
    ]],
    'payer' => ['name' => $nombre],
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
