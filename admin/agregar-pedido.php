<?php
declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

lulu_admin_requerir('Cargar pedido manual');

$error = '';
$valores = ['nombre' => '', 'telefono' => '', 'descripcion' => '', 'total' => '', 'direccion' => '', 'localidad' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $valores['nombre'] = trim((string) ($_POST['nombre'] ?? ''));
    $valores['telefono'] = trim((string) ($_POST['telefono'] ?? ''));
    $valores['descripcion'] = trim((string) ($_POST['descripcion'] ?? ''));
    $valores['total'] = trim((string) ($_POST['total'] ?? ''));
    $valores['direccion'] = trim((string) ($_POST['direccion'] ?? ''));
    $valores['localidad'] = trim((string) ($_POST['localidad'] ?? ''));
    $entrega = ($_POST['entrega'] ?? 'retiro') === 'envio' ? 'envio' : 'retiro';
    $estado = ($_POST['estado'] ?? 'aprobado') === 'pendiente' ? 'pendiente' : 'aprobado';
    $total = (int) preg_replace('/\D/', '', $valores['total']);

    if ($valores['nombre'] === '' || mb_strlen($valores['nombre']) > 80) {
        $error = 'Ingresá el nombre del cliente.';
    } elseif ($valores['descripcion'] === '' || mb_strlen($valores['descripcion']) > 300) {
        $error = 'Describí qué compró (máx. 300 caracteres).';
    } elseif ($total < 1) {
        $error = 'Ingresá un monto válido, mayor a $0.';
    } elseif ($entrega === 'envio' && ($valores['direccion'] === '' || $valores['localidad'] === '')) {
        $error = 'Faltan los datos de envío.';
    } else {
        $items = json_encode([[
            'productId' => null,
            'nombre' => $valores['descripcion'],
            'cantidad' => 1,
            'precioUnitario' => $total,
            'colorNombre' => null,
            'talle' => null,
        ]], JSON_UNESCAPED_UNICODE);

        $pdo = lulu_db();
        $stmt = $pdo->prepare(
            'INSERT INTO pedidos
                (canal, estado, modo, nombre, telefono, entrega, direccion, localidad, items, subtotal, total, creado_en)
             VALUES
                ("meta", ?, "minorista", ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $stmt->execute([
            $estado,
            $valores['nombre'],
            $valores['telefono'] ?: null,
            $entrega,
            $entrega === 'envio' ? $valores['direccion'] : null,
            $entrega === 'envio' ? $valores['localidad'] : null,
            $items,
            $total,
            $total,
        ]);

        header('Location: pedidos.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Cargar pedido manual | Lulú Lulú</title>
  <style>
    <?= lulu_admin_css() ?>
    .campo{ margin-bottom: 16px; }
    .campo label{ display:block; font-weight:700; font-size:.85rem; margin-bottom: 6px; }
    .campo input[type=text], .campo input[type=tel], .campo textarea, .campo select{
      width:100%; padding:10px 12px; border-radius:10px; border:1px solid #ddd; font-size:1rem; font-family: inherit; box-sizing: border-box;
    }
    .campo textarea{ resize: vertical; }
    .radios{ display:flex; gap:16px; }
    .radios label{ font-weight:500; display:flex; align-items:center; gap:6px; }
    .volver{ display:inline-block; margin-bottom: 14px; color:#7c46bf; text-decoration:none; font-weight:700; font-size:.85rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <a class="volver" href="pedidos.php">← Volver a pedidos</a>
    <h1>📸 Cargar pedido manual</h1>
    <p class="sub">Para ventas cerradas por Instagram o Facebook, que no pasan por el sitio.</p>
    <div class="card">
      <form method="post">
        <div class="campo">
          <label for="nombre">Nombre del cliente</label>
          <input type="text" id="nombre" name="nombre" value="<?= htmlspecialchars($valores['nombre']) ?>" required maxlength="80">
        </div>
        <div class="campo">
          <label for="telefono">Teléfono <span style="font-weight:400;color:#6b6178">(opcional)</span></label>
          <input type="tel" id="telefono" name="telefono" value="<?= htmlspecialchars($valores['telefono']) ?>" maxlength="24">
        </div>
        <div class="campo">
          <label for="descripcion">Qué compró</label>
          <textarea id="descripcion" name="descripcion" rows="2" required maxlength="300" placeholder="Ej: 2x Sueño Rubí color gris"><?= htmlspecialchars($valores['descripcion']) ?></textarea>
        </div>
        <div class="campo">
          <label for="total">Total $</label>
          <input type="text" inputmode="numeric" id="total" name="total" value="<?= htmlspecialchars($valores['total']) ?>" required placeholder="Ej: 55000">
        </div>
        <div class="campo">
          <label>¿Ya cobraste?</label>
          <div class="radios">
            <label><input type="radio" name="estado" value="aprobado" checked> Sí, ya cobré</label>
            <label><input type="radio" name="estado" value="pendiente"> Todavía no</label>
          </div>
        </div>
        <div class="campo">
          <label>Entrega</label>
          <div class="radios">
            <label><input type="radio" name="entrega" value="retiro" checked id="entregaRetiro"> Retira en el local</label>
            <label><input type="radio" name="entrega" value="envio" id="entregaEnvio"> Envío</label>
          </div>
        </div>
        <div id="camposEnvio" style="display:none">
          <div class="campo">
            <label for="direccion">Dirección</label>
            <input type="text" id="direccion" name="direccion" value="<?= htmlspecialchars($valores['direccion']) ?>" maxlength="120">
          </div>
          <div class="campo">
            <label for="localidad">Localidad</label>
            <input type="text" id="localidad" name="localidad" value="<?= htmlspecialchars($valores['localidad']) ?>" maxlength="80">
          </div>
        </div>
        <?php if ($error): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
        <button type="submit">Guardar pedido</button>
      </form>
    </div>
  </div>
  <script>
    var envio = document.getElementById('entregaEnvio');
    var retiro = document.getElementById('entregaRetiro');
    var campos = document.getElementById('camposEnvio');
    function actualizar(){ campos.style.display = envio.checked ? 'block' : 'none'; }
    envio.addEventListener('change', actualizar);
    retiro.addEventListener('change', actualizar);
    actualizar();
  </script>
</body>
</html>
