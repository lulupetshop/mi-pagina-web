<?php
declare(strict_types=1);

require_once __DIR__ . '/sesion_helper.php';

header('Content-Type: application/json; charset=utf-8');

lulu_iniciar_sesion();
$_SESSION = [];
session_unset();
session_destroy();

echo json_encode(['ok' => true]);
