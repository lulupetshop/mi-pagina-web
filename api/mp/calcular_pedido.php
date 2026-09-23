<?php
declare(strict_types=1);

require_once __DIR__ . '/productos.php';

function lulu_error(string $msg, int $code = 400): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

/**
 * Valida el body de un pedido (carrito + datos del cliente) y calcula
 * los precios reales del lado del servidor. La usan tanto
 * crear-preferencia.php (Mercado Pago) como registrar-pedido-whatsapp.php,
 * para que los dos calculen exactamente lo mismo sin duplicar la
 * validación en dos lugares.
 */
function lulu_validar_y_calcular_pedido(array $body): array
{
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

    return [
        'nombre' => $nombre,
        'telefono' => $telefono,
        'entrega' => $entrega,
        'direccion' => $direccion,
        'localidad' => $localidad,
        'observaciones' => $observaciones,
        'modo' => $modo,
        'items' => $items,
        'subtotal' => $subtotal,
        'descuento' => $descuento,
        'descuentoSegunda' => $descuentoSegunda,
        'total' => $total,
    ];
}
