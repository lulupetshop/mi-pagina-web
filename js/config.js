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
  MODO_EJEMPLO: true,

  // Cantidad mínima de unidades (combinando modelos y talles) para acceder
  // al precio mayorista.
  MAYORISTA_MIN_UNIDADES: 10,

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
