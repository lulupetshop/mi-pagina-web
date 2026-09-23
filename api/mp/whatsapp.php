<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * Convierte un teléfono argentino cargado en el checkout (área + número,
 * sin 0 ni 15, ej: "3511234567") al formato que espera WhatsApp para
 * celulares de Argentina: 54 9 <área> <número>.
 */
function lulu_wa_formatear_numero(string $telefono): string
{
    $digitos = preg_replace('/\D+/', '', $telefono) ?? '';
    if (str_starts_with($digitos, '54')) {
        return $digitos;
    }
    return '549' . $digitos;
}

/**
 * Manda el WhatsApp de "gracias por tu compra" cuando un pedido pasa a
 * aprobado. No corta la ejecución si algo falla (falta configurar Meta
 * todavía, el número es inválido, etc.): el pago ya se procesó bien, el
 * WhatsApp es un plus, nunca debe romper esa confirmación.
 */
function lulu_enviar_whatsapp_confirmacion(array $pedido): void
{
    $config = lulu_config();
    $phoneNumberId = $config['wa_phone_number_id'] ?? '';
    $accessToken = $config['wa_access_token'] ?? '';
    $template = $config['wa_template_name'] ?? '';

    if ($phoneNumberId === '' || $phoneNumberId === 'PENDIENTE'
        || $accessToken === '' || $accessToken === 'PENDIENTE'
        || $template === '' || $template === 'PENDIENTE') {
        return;
    }

    $numero = lulu_wa_formatear_numero((string) $pedido['telefono']);
    $nombre = (string) $pedido['nombre'];
    $pedidoId = (string) $pedido['id'];

    $payload = [
        'messaging_product' => 'whatsapp',
        'to' => $numero,
        'type' => 'template',
        'template' => [
            'name' => $template,
            'language' => ['code' => $config['wa_template_lang'] ?? 'es_AR'],
            'components' => [[
                'type' => 'body',
                'parameters' => [
                    ['type' => 'text', 'text' => $nombre],
                    ['type' => 'text', 'text' => $pedidoId],
                ],
            ]],
        ],
    ];

    $ch = curl_init("https://graph.facebook.com/v21.0/{$phoneNumberId}/messages");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            "Authorization: Bearer {$accessToken}",
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 10,
    ]);
    curl_exec($ch);
    curl_close($ch);
}
