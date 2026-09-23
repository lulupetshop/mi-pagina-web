-- Ejecutar una sola vez en phpMyAdmin (pestaña SQL), sobre la misma base
-- que ya usan Mercado Pago y las cuentas.

ALTER TABLE pedidos
  ADD COLUMN canal VARCHAR(20) NOT NULL DEFAULT 'mercadopago' AFTER estado;
