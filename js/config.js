/* ==========================================================================
   Lulú Lulú — Configuración del sitio
   Editá los valores de acá para adaptar el sitio sin tocar el resto del
   código. No es un módulo: se carga como script clásico antes que
   products.js y app.js.
   ========================================================================== */
const CONFIG = {
  // Número de WhatsApp en formato internacional, solo dígitos (código de
  // país + código de área + número, sin '+', espacios ni guiones).
  // Ejemplo Argentina: 54 9 351 234 5678 -> "5493512345678"
  WHATSAPP_NUMBER: "5493517642818",

  // Mientras esté en true se muestra el aviso de sitio de demostración y la
  // etiqueta "Ejemplo" en las fotos de producto. Poné false cuando cargues
  // fotos y precios reales.
  MODO_EJEMPLO: false,

  // Cantidad mínima de unidades (combinando modelos y talles) para acceder
  // al precio mayorista.
  MAYORISTA_MIN_UNIDADES: 10,

  // Promoción de adquisición.
  PRIMERA_COMPRA: {
    ACTIVO: true,
    DESCUENTO_PCT: 15,
    ENVIO_GRATIS: true,
  },

  SEGUNDA_UNIDAD: {
    ACTIVO: true,
    DESCUENTO_PCT: 50,
  },

  // Métodos de pago que se muestran y se envían a WhatsApp.
  MEDIOS_PAGO: ["Mercado Pago", "Transferencia bancaria"],

  // Analítica. Completá UNO o ambos IDs cuando los tengas:
  // GA4: G-XXXXXXXXXX | Google Tag Manager: GTM-XXXXXXX.
  // Si ambos están vacíos, el sitio no carga ningún tracker.
  ANALYTICS: {
    ACTIVO: true,
    GA4_MEASUREMENT_ID: "G-809E9P16G7",
    GTM_CONTAINER_ID: "",
  },

  // Producto que se destaca en la sección "Producto estrella" y su
  // descuento de primera compra. Poné ACTIVO en false para ocultar esa
  // sección. El PRODUCTO_ID tiene que existir en products.js.
  PRODUCTO_ESTRELLA: {
    ACTIVO: true,
    PRODUCTO_ID: "moises-rubi",
    DESCUENTO_PCT: 15,
  },

  // Textos de los mensajes que se abren en WhatsApp.
  MENSAJES: {
    consulta:
      "Hola! Vi la página de Lulú Lulú y quería consultar por las camas para mi mascota. 🐾",
    mayorista:
      "Hola! Quería consultar por la compra mayorista de camas para perros y gatos.",
  },
};
