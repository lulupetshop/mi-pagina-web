<?php
declare(strict_types=1);

/**
 * Espejo de los precios reales en js/products.js, para validar el total
 * del lado del servidor antes de cobrar (nunca hay que confiar en el
 * precio que manda el navegador: alguien podría editarlo con las
 * herramientas de desarrollador antes de enviar el pedido).
 *
 * IMPORTANTE: si cambiás un precio o agregás un producto en
 * js/products.js, actualizá también esta lista o el pago va a fallar
 * (o va a cobrar de más/de menos).
 */
function lulu_productos(): array
{
    return [
        'moises-rubi' => ['nombre' => 'Sueño Rubí', 'minorista' => 65000, 'mayorista' => 36114],
        'colchon-redondo-desmontable' => ['nombre' => 'Sueño Nube', 'minorista' => 70000, 'mayorista' => 38892],
        'colchoneta-desmontable' => ['nombre' => 'Sueño Zen', 'minorista' => 75000, 'mayorista' => 41670],
        'moises-redondo' => ['nombre' => 'Sueño Abrazo', 'minorista' => 65000, 'mayorista' => 36114],
        'nido-onix' => ['nombre' => 'Sueño Ónix', 'minorista' => 45000, 'mayorista' => 25002],
    ];
}
