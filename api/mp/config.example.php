<?php
/**
 * Copiá este archivo a config.php (mismo directorio) y completá los datos
 * reales ahí. config.php NUNCA se sube al repositorio (está en
 * .gitignore): se crea una sola vez, a mano, directo en el Administrador
 * de archivos de Hostinger, para que la contraseña de la base y el token
 * de Mercado Pago no queden expuestos en GitHub.
 */

return [
    // hPanel → Bases de datos → Administración
    'db_host' => 'localhost',
    'db_name' => 'u287453539_lulu_mp',
    'db_user' => 'u287453539_lulu_mp',
    'db_pass' => 'PEGÁ_ACÁ_LA_CONTRASEÑA_DE_LA_BASE',

    // mercadopago.com.ar/developers → Tus integraciones → (tu app) → Credenciales
    // Empezá con las de PRUEBA (arrancan con "TEST-") hasta confirmar que
    // todo el flujo funciona antes de pasar a las de producción.
    'mp_access_token' => 'TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
];
