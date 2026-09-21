<?php
/**
 * Copiá este archivo a "config.php" (en la misma carpeta) y completá tus
 * datos reales. "config.php" está en .gitignore: nunca se sube al repositorio.
 *
 * Cómo obtener las credenciales:
 * 1. Entrá a https://www.mercadopago.com.ar/developers/panel/app
 * 2. Creá una aplicación (o usá una existente).
 * 3. En "Credenciales de producción" o "Credenciales de prueba" copiá el
 *    "Access Token". Usá las de PRUEBA mientras testeás, y las de
 *    PRODUCCIÓN cuando el sitio esté en vivo con dominio real.
 */

return [
    // Access Token de Mercado Pago (server-side, NUNCA lo pongas en el HTML/JS).
    'mp_access_token' => 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000',

    // URL pública base del sitio (sin barra final), usada para las páginas
    // de retorno y para el webhook. Ej: "https://tudominio.com/tienda-tecnologia"
    'site_url' => 'https://tudominio.com/tienda-tecnologia',
];
