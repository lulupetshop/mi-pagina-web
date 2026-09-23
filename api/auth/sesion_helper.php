<?php
declare(strict_types=1);

require_once __DIR__ . '/../mp/db.php';

/**
 * Arranca la sesión con una cookie de larga duración (30 días), para que
 * el cliente no tenga que loguearse cada vez que entra al sitio.
 */
function lulu_iniciar_sesion(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 30,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

/** Devuelve el id del usuario logueado, o null si no hay sesión. */
function lulu_usuario_actual(): ?int
{
    lulu_iniciar_sesion();
    return isset($_SESSION['usuario_id']) ? (int) $_SESSION['usuario_id'] : null;
}

/** Corta la ejecución con 401 si no hay una sesión activa. */
function lulu_requerir_sesion(): int
{
    $usuarioId = lulu_usuario_actual();
    if ($usuarioId === null) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Necesitás iniciar sesión.']);
        exit;
    }
    return $usuarioId;
}
