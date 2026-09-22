/* Lulú Lulú — Configuración */
const CONFIG = {
  WHATSAPP_NUMBER: "5493517642818",
  META_PIXEL_ID: "1961672001168621",
  DEBUG_PIXEL: false,
  MODO_EJEMPLO: false,
  MAYORISTA_MIN_UNIDADES: 10,
  PRIMERA_COMPRA: { ACTIVO: true, DESCUENTO_PCT: 15, ENVIO_GRATIS: true },
  SEGUNDA_UNIDAD: { ACTIVO: true, DESCUENTO_PCT: 50 },
  MEDIOS_PAGO: ["Mercado Pago", "Transferencia bancaria"],
  ANALYTICS: {
    ACTIVO: true,
    GA4_MEASUREMENT_ID: "G-809E9P16G7",
    GTM_CONTAINER_ID: "",
  },
  PRODUCTO_ESTRELLA: {
    ACTIVO: true,
    PRODUCTO_ID: "moises-rubi",
    DESCUENTO_PCT: 15,
  },
  MENSAJES: {
    consulta: "Hola! Vi la página de Lulú Lulú y quería consultar por las camas para mi mascota. 🐾",
    mayorista: "Hola! Quería consultar por la compra mayorista de camas para perros y gatos.",
  },
};
   window.CONFIG = CONFIG;
