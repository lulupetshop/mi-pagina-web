<?php
declare(strict_types=1);

require_once __DIR__ . '/sesion_helper.php';

header('Content-Type: application/json; charset=utf-8');

function lulu_mascotas_error(string $msg, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

$usuarioId = lulu_requerir_sesion();
$pdo = lulu_db();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->prepare('SELECT id, nombre, tipo, raza, tamano, fecha_nacimiento, notas FROM mascotas WHERE usuario_id = ? ORDER BY id DESC');
    $stmt->execute([$usuarioId]);
    echo json_encode(['ok' => true, 'mascotas' => $stmt->fetchAll()]);
    exit;
}

if ($metodo === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($body)) {
        lulu_mascotas_error('Datos inválidos.');
    }

    $nombre = trim((string) ($body['nombre'] ?? ''));
    $tipo = trim((string) ($body['tipo'] ?? ''));
    $raza = trim((string) ($body['raza'] ?? ''));
    $tamano = trim((string) ($body['tamano'] ?? ''));
    $fechaNacimiento = trim((string) ($body['fecha_nacimiento'] ?? ''));
    $notas = trim((string) ($body['notas'] ?? ''));

    if ($nombre === '' || mb_strlen($nombre) > 60) {
        lulu_mascotas_error('Ingresá el nombre de tu mascota.');
    }
    if (!in_array($tipo, ['perro', 'gato', 'otro'], true)) {
        lulu_mascotas_error('Elegí el tipo de mascota.');
    }
    if ($tamano !== '' && !in_array($tamano, ['pequeño', 'mediano', 'grande'], true)) {
        lulu_mascotas_error('Tamaño inválido.');
    }
    if (mb_strlen($raza) > 80 || mb_strlen($notas) > 300) {
        lulu_mascotas_error('Alguno de los datos es demasiado largo.');
    }
    $fechaValida = null;
    if ($fechaNacimiento !== '') {
        $d = DateTime::createFromFormat('Y-m-d', $fechaNacimiento);
        if (!$d || $d->format('Y-m-d') !== $fechaNacimiento) {
            lulu_mascotas_error('Fecha de nacimiento inválida.');
        }
        $fechaValida = $fechaNacimiento;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO mascotas (usuario_id, nombre, tipo, raza, tamano, fecha_nacimiento, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $usuarioId,
        $nombre,
        $tipo,
        $raza !== '' ? $raza : null,
        $tamano !== '' ? $tamano : null,
        $fechaValida,
        $notas !== '' ? $notas : null,
    ]);

    echo json_encode(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);
    exit;
}

if ($metodo === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id < 1) {
        lulu_mascotas_error('Falta el id de la mascota.');
    }
    $stmt = $pdo->prepare('DELETE FROM mascotas WHERE id = ? AND usuario_id = ?');
    $stmt->execute([$id, $usuarioId]);
    echo json_encode(['ok' => true]);
    exit;
}

lulu_mascotas_error('Método no permitido.', 405);
