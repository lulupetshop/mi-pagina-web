/* ==========================================================================
   Lulú Lulú — Configuración del sitio
   Editá los valores de acá para adaptar el sitio sin tocar el resto del
   código. No es un módulo: se carga como script clásico antes que
   products.js y app.js.
   ========================================================================== */
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

/* ========================================================================
   META PIXEL — configurable, con eventID, debug y deduplicación
   ======================================================================== */
(function setupLuluMetaPixel(config) {
  "use strict";

  const pixelId = String(config.META_PIXEL_ID || "").trim();
  const debug = config.DEBUG_PIXEL === true || new URLSearchParams(window.location.search).get("debug_pixel") === "1";
  if (!/^\d{5,20}$/.test(pixelId) || pixelId === "YOUR_PIXEL_ID") return;

  const seenActions = new Map();
  let rawFbq = null;
  let initialized = false;
  let pageViewSent = false;

  function newEventId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "lulu-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11);
  }

  function once(key, windowMs) {
    const now = Date.now();
    const previous = seenActions.get(key) || 0;
    if (now - previous < windowMs) return false;
    seenActions.set(key, now);
    if (seenActions.size > 100) {
      for (const [k, t] of seenActions) if (now - t > 10000) seenActions.delete(k);
    }
    return true;
  }

  function debugLog(name, params, id) {
    if (debug) console.info("[Lulú Meta Pixel]", name, params, "eventID:", id);
  }

  function wrapFbq(fn) {
    if (typeof fn !== "function" || fn.__luluMetaWrapped) return fn;
    const wrapped = function () {
      const args = Array.prototype.slice.call(arguments);
      const command = args[0];
      const name = args[1];
      const params = args[2] && typeof args[2] === "object" ? args[2] : {};
      let options = args[3] && typeof args[3] === "object" ? args[3] : {};

      if (command === "init" && name === pixelId) {
        if (initialized) return;
        initialized = true;
      }
      if (command === "track" && name === "PageView") {
        if (pageViewSent) return;
        pageViewSent = true;
      }
      // Evita el Contact antiguo del app.js; el evento correcto lo genera este módulo.
      if (command === "track" && name === "Contact" && params.source && !params.contact_type) return;

      if (command === "track" && name !== "PageView" && !options.eventID) {
        options = Object.assign({}, options, { eventID: newEventId() });
        args[3] = options;
      }
      if (command === "track") debugLog(name, params, options.eventID || "page-load");
      return fn.apply(this, args);
    };
    wrapped.__luluMetaWrapped = true;
    return wrapped;
  }

  try {
    Object.defineProperty(window, "fbq", {
      configurable: true,
      get: function () { return rawFbq; },
      set: function (value) { rawFbq = wrapFbq(value); },
    });
  } catch (e) {}

  // Snippet oficial de Meta. El ID se obtiene exclusivamente de CONFIG.
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");

  function getProduct(id) {
    if (!id || typeof PRODUCTS === "undefined") return null;
    return PRODUCTS.find(function (product) { return product.id === id; }) || null;
  }

  function currentMode() {
    const checked = document.querySelector('input[name="purchase-mode"]:checked');
    return checked ? checked.value : "minorista";
  }

  function productPrice(product) {
    if (!product || !product.tamanos || !product.tamanos.length) return 0;
    const mode = currentMode();
    return Math.min.apply(Math, product.tamanos.map(function (size) {
      return Number(mode === "mayorista" ? size.mayorista : size.minorista) || 0;
    }));
  }

  function parsePrice(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const digits = String(value || "").replace(/[^0-9-]/g, "");
    return digits ? Number(digits) : 0;
  }

  function readCart() {
    try {
      const raw = localStorage.getItem("lulu:cart:v1");
      const cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (e) { return []; }
  }

  function cartContents(cart) {
    const mode = currentMode();
    const grouped = new Map();
    cart.forEach(function (item) {
      const id = String(item.id || "");
      const quantity = Math.max(0, Number(item.cantidad) || 0);
      if (!id || !quantity) return;
      const itemPrice = Number(mode === "mayorista" ? item.precioMayorista : item.precioMinorista) || 0;
      const key = id + "|" + itemPrice;
      const current = grouped.get(key) || { id: id, quantity: 0, item_price: itemPrice };
      current.quantity += quantity;
      grouped.set(key, current);
    });
    return Array.from(grouped.values());
  }

  function cartSignature(cart) {
    return cart.map(function (item) {
      return [item.id, item.cantidad, item.precioMinorista, item.precioMayorista].join(":");
    }).sort().join("|");
  }

  function cartTotal() {
    const visible = parsePrice(document.querySelector("#checkoutTotal")?.textContent || document.querySelector("#cartTotal")?.textContent || "");
    if (visible > 0) return visible;

    const cart = readCart();
    const mode = currentMode();
    const subtotal = cart.reduce(function (sum, item) {
      const price = Number(mode === "mayorista" ? item.precioMayorista : item.precioMinorista) || 0;
      return sum + price * (Number(item.cantidad) || 0);
    }, 0);
    let total = subtotal;
    let firstPurchase = true;
    try { firstPurchase = !localStorage.getItem("lulu:first-purchase-redeemed:v2"); } catch (e) {}
    if (firstPurchase && mode !== "mayorista" && config.PRIMERA_COMPRA.ACTIVO) {
      total -= Math.round(subtotal * (Number(config.PRIMERA_COMPRA.DESCUENTO_PCT) / 100));
    }
    if (mode !== "mayorista" && config.SEGUNDA_UNIDAD.ACTIVO && cart.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0) >= 2) {
      const units = [];
      cart.forEach(function (item) {
        const price = Number(item.precioMinorista) || 0;
        for (let i = 0; i < (Number(item.cantidad) || 0); i++) units.push(price);
      });
      units.sort(function (a, b) { return a - b; });
      if (units.length >= 2) total -= Math.round(units[0] * (Number(config.SEGUNDA_UNIDAD.DESCUENTO_PCT) / 100));
    }
    return Math.max(0, Math.round(total));
  }

  function fire(name, params, dedupeKey) {
    if (!window.fbq || typeof window.fbq !== "function") return;
    if (dedupeKey && !once(dedupeKey, 800)) return;
    const id = newEventId();
    const payload = Object.assign({}, params || {});
    debugLog(name, payload, id);
    window.fbq("track", name, payload, { eventID: id });
  }

  function fireViewContent(productId) {
    const product = getProduct(productId);
    if (!product) return;
    fire("ViewContent", {
      content_ids: [product.id],
      content_type: "product",
      content_name: product.nombre,
      content_category: product.categoria,
      value: Number(productPrice(product)) || 0,
      currency: "ARS",
    }, "view:" + product.id);
  }

  function addedItems(before, after) {
    const beforeMap = new Map(before.map(function (item) { return [String(item.id), Number(item.cantidad) || 0]; }));
    return after.map(function (item) {
      const id = String(item.id || "");
      const quantity = Number(item.cantidad) || 0;
      const previous = beforeMap.get(id) || 0;
      return quantity > previous ? { item: item, delta: quantity - previous } : null;
    }).filter(Boolean);
  }

  function fireAddToCart(before, after) {
    addedItems(before, after).forEach(function (entry) {
      const item = entry.item;
      const mode = currentMode();
      const unitPrice = Number(mode === "mayorista" ? item.precioMayorista : item.precioMinorista) || 0;
      fire("AddToCart", {
        content_ids: [String(item.id)],
        content_type: "product",
        content_name: String(item.nombre || item.id),
        value: unitPrice,
        currency: "ARS",
        contents: [{ id: String(item.id), quantity: entry.delta, item_price: unitPrice }],
        num_items: entry.delta,
      }, "add:" + item.id + ":" + entry.delta + ":" + cartSignature(after));
    });
  }

  function fireInitiateCheckout() {
    const cart = readCart();
    const contents = cartContents(cart);
    const numItems = contents.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    if (!numItems) return;
    fire("InitiateCheckout", {
      value: Number(cartTotal()) || 0,
      currency: "ARS",
      content_ids: contents.map(function (item) { return item.id; }),
      num_items: numItems,
      contents: contents,
    }, "checkout:" + cartSignature(cart));
  }

  function fireContact(type) {
    const cart = readCart();
    const contents = cartContents(cart);
    const payload = { contact_type: type };
    if (type === "pedido") {
      payload.value = Number(cartTotal()) || 0;
      payload.currency = "ARS";
      payload.content_ids = contents.map(function (item) { return item.id; });
      payload.num_items = contents.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      payload.contents = contents;
    }
    fire("Contact", payload, "contact:" + type + ":" + (type === "pedido" ? cartSignature(cart) : ""));
  }

  function classifyWhatsAppUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      if (!/wa\.me$/i.test(parsed.hostname)) return null;
      const text = parsed.searchParams.get("text") || "";
      return /quiero hacer este pedido/i.test(text) || /este pedido en lulú/i.test(text) ? "pedido" : "consulta";
    } catch (e) {
      return /wa\.me/i.test(String(url || "")) ? "consulta" : null;
    }
  }

  if (!window.__luluMetaOpenWrapped) {
    const originalOpen = window.open;
    window.open = function (url) {
      const result = originalOpen.apply(window, arguments);
      const type = classifyWhatsAppUrl(url);
      if (type) fireContact(type);
      return result;
    };
    window.__luluMetaOpenWrapped = true;
  }

  function setupMetaUiEvents() {
    let beforeAddCart = [];

    document.addEventListener("click", function (event) {
      const productTrigger = event.target.closest("[data-product-id]");
      const starTrigger = event.target.closest("[data-star-open]");
      const productId = productTrigger?.dataset.productId || (starTrigger ? config.PRODUCTO_ESTRELLA?.PRODUCTO_ID : null);

      if (productId) {
        setTimeout(function () {
          const dialog = document.getElementById("productDialog");
          if (dialog?.open) fireViewContent(productId);
        }, 0);
      }

      const addButton = event.target.closest("#pAdd");
      if (addButton) {
        beforeAddCart = readCart();
        [50, 150, 300].forEach(function (delay) {
          setTimeout(function () { fireAddToCart(beforeAddCart, readCart()); }, delay);
        });
      }

      const checkoutButton = event.target.closest("#cartCheckout");
      if (checkoutButton) setTimeout(fireInitiateCheckout, 50);

      const waAnchor = event.target.closest('a[href*="wa.me"]');
      if (waAnchor) {
        const type = classifyWhatsAppUrl(waAnchor.href) || "consulta";
        setTimeout(function () { fireContact(type); }, 0);
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMetaUiEvents, { once: true });
  } else {
    setupMetaUiEvents();
  }
})(CONFIG);
