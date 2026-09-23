-- Ejecutar una sola vez en phpMyAdmin (pestaña SQL), sobre la misma base
-- que ya usa Mercado Pago (ej: u287453539_lulu_mp).

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  nombre VARCHAR(80) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS magic_links (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expira_en DATETIME NOT NULL,
  usado_en DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  CONSTRAINT fk_magic_links_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mascotas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(60) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  raza VARCHAR(80) NULL,
  tamano VARCHAR(20) NULL,
  fecha_nacimiento DATE NULL,
  notas VARCHAR(300) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario_id),
  CONSTRAINT fk_mascotas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vincula cada pedido pagado con la cuenta del cliente (si inició sesión
-- antes de pagar). Puede quedar NULL: un pedido de alguien sin cuenta
-- sigue funcionando igual, simplemente no aparece en "Mis pedidos".
ALTER TABLE pedidos
  ADD COLUMN usuario_id INT UNSIGNED NULL AFTER id,
  ADD INDEX idx_pedidos_usuario (usuario_id),
  ADD CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
