<?php
declare(strict_types=1);

require_once __DIR__ . '/sesion_helper.php';

header('Content-Type: application/json; charset=utf-8');

$usuarioId = lulu_usuario_actual();
if ($usuarioId === null) {
    echo json_encode(['ok' => true, 'logueado' => false]);
    exit;
}

$pdo = lulu_db();
$stmt = $pdo->prepare('SELECT id, email, nombre FROM usuarios WHERE id = ?');
$stmt->execute([$usuarioId]);
$usuario = $stmt->fetch();

if (!$usuario) {
    // La cuenta ya no existe pero la sesión seguía activa: la limpiamos.
    session_unset();
    session_destroy();
    echo json_encode(['ok' => true, 'logueado' => false]);
    exit;
}

echo json_encode(['ok' => true, 'logueado' => true, 'usuario' => $usuario]);
