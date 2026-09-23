-- Ejecutar una sola vez en phpMyAdmin (pestaña SQL), sobre la base
-- creada para Mercado Pago (ej: u287453539_lulu_mp).

CREATE TABLE IF NOT EXISTS pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  mp_preference_id VARCHAR(64) NULL,
  mp_payment_id VARCHAR(64) NULL,
  modo VARCHAR(20) NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  telefono VARCHAR(24) NOT NULL,
  entrega VARCHAR(10) NOT NULL,
  direccion VARCHAR(120) NULL,
  localidad VARCHAR(80) NULL,
  observaciones VARCHAR(400) NULL,
  items JSON NOT NULL,
  subtotal INT UNSIGNED NOT NULL,
  descuento INT UNSIGNED NOT NULL DEFAULT 0,
  descuento_segunda INT UNSIGNED NOT NULL DEFAULT 0,
  total INT UNSIGNED NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL,
  INDEX idx_estado (estado),
  INDEX idx_mp_preference (mp_preference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
