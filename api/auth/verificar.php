<?php
declare(strict_types=1);

require_once __DIR__ . '/sesion_helper.php';

$token = (string) ($_GET['token'] ?? '');

function lulu_ir_a_cuenta(string $query = ''): void
{
    header('Location: /cuenta.html' . $query);
    exit;
}

if ($token === '' || !ctype_xdigit($token)) {
    lulu_ir_a_cuenta('?acceso=invalido');
}

$tokenHash = hash('sha256', $token);
$pdo = lulu_db();

$stmt = $pdo->prepare(
    'SELECT id, usuario_id FROM magic_links
     WHERE token_hash = ? AND usado_en IS NULL AND expira_en > NOW()
     LIMIT 1'
);
$stmt->execute([$tokenHash]);
$link = $stmt->fetch();

if (!$link) {
    lulu_ir_a_cuenta('?acceso=invalido');
}

$pdo->prepare('UPDATE magic_links SET usado_en = NOW() WHERE id = ?')->execute([$link['id']]);

lulu_iniciar_sesion();
session_regenerate_id(true);
$_SESSION['usuario_id'] = (int) $link['usuario_id'];

lulu_ir_a_cuenta('?acceso=ok');
