<?php
declare(strict_types=1);

require_once __DIR__ . '/sesion_helper.php';

header('Content-Type: application/json; charset=utf-8');

function lulu_auth_error(string $msg, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lulu_auth_error('Método no permitido.', 405);
}

$body = json_decode((string) file_get_contents('php://input'), true);
$email = is_array($body) ? trim((string) ($body['email'] ?? '')) : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    lulu_auth_error('Ingresá un email válido.');
}

$pdo = lulu_db();

// Busca el usuario o lo crea si es la primera vez (login y registro son
// el mismo flujo: no hace falta un paso de "crear cuenta" aparte).
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
$usuarioId = $stmt->fetchColumn();

if (!$usuarioId) {
    $stmt = $pdo->prepare('INSERT INTO usuarios (email) VALUES (?)');
    $stmt->execute([$email]);
    $usuarioId = (int) $pdo->lastInsertId();
}

$token = bin2hex(random_bytes(32));
$tokenHash = hash('sha256', $token);
$expira = (new DateTime('+15 minutes'))->format('Y-m-d H:i:s');

$stmt = $pdo->prepare('INSERT INTO magic_links (usuario_id, token_hash, expira_en) VALUES (?, ?, ?)');
$stmt->execute([$usuarioId, $tokenHash, $expira]);

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'lulutiendaparamascotas.shop';
$link = "{$scheme}://{$host}/api/auth/verificar.php?token={$token}";

$config = lulu_config();
$asunto = 'Tu acceso a Lulú Lulú';
$mensajeTexto = "Hola!\n\nTocá este link para entrar a tu cuenta en Lulú Lulú (vale por 15 minutos):\n{$link}\n\nSi vos no pediste esto, podés ignorar este mail.";
$mensajeHtml = "<p>Hola!</p><p>Tocá el siguiente botón para entrar a tu cuenta en Lulú Lulú (el link vale por 15 minutos):</p>"
    . "<p><a href=\"{$link}\" style=\"display:inline-block;padding:12px 22px;background:#7c46bf;color:#fff;border-radius:999px;text-decoration:none;font-weight:700\">Entrar a mi cuenta</a></p>"
    . "<p>Si el botón no funciona, copiá y pegá este link en el navegador:<br>{$link}</p>"
    . "<p>Si vos no pediste esto, podés ignorar este mail.</p>";

$from = $config['mail_from'] ?? 'no-responder@' . $host;
$fromName = $config['mail_from_name'] ?? 'Lulú Lulú';
$boundary = md5((string) microtime());
$headers = "From: {$fromName} <{$from}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";

$body2 = "--{$boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n{$mensajeTexto}\r\n"
    . "--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n{$mensajeHtml}\r\n"
    . "--{$boundary}--";

try {
    @mail($email, $asunto, $body2, $headers);
} catch (Throwable $e) {
    // No cortamos la respuesta por un error de envío: igual devolvemos
    // "ok" (ver nota más abajo sobre por qué no delatamos si el mail
    // existe o no).
}

// Respuesta genérica siempre, exista o no el email, para no revelar qué
// direcciones están registradas.
echo json_encode(['ok' => true]);
