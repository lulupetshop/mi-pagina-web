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

    // Dirección desde la que salen los mails de "ingresar a tu cuenta".
    // Si tenés un casillero en Hostinger (hPanel → Emails), usá uno de
    // ese dominio para que no vaya a spam (ej: no-responder@lulutiendaparamascotas.shop).
    'mail_from' => 'no-responder@lulutiendaparamascotas.shop',
    'mail_from_name' => 'Lulú Lulú',

    // developers.facebook.com → tu app → WhatsApp → Primeros pasos.
    // Dejalo así (con "PENDIENTE") hasta tener los datos reales: mientras
    // falten, el sitio simplemente no manda el WhatsApp automático, sin
    // romper nada del resto del pago.
    'wa_phone_number_id' => 'PENDIENTE',
    'wa_access_token' => 'PENDIENTE',
    // Nombre exacto de la plantilla aprobada en Meta para este mensaje.
    'wa_template_name' => 'PENDIENTE',
    'wa_template_lang' => 'es_AR',
];
