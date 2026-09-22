/* ==========================================================================
   Lulú Lulú — Lógica del sitio
   Catálogo, carrito y pedido por WhatsApp. Sin módulos ni librerías
   externas: usa CONFIG (config.js) y PRODUCTS (products.js), cargados
   antes que este archivo.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  function formatPrice(n) {
    return "$ " + Math.round(n).toLocaleString("es-AR");
  }

  function digitsOnly(str) {
    return (str || "").replace(/\D/g, "");
  }

  const CATEGORIA_ORDEN = [
    "Moisés Rectangular",
    "Moisés Redondo",
    "Nido Cuadrado",
    "Nido Rectangular",
    "Nido Redondo",
    "Antiestrés",
    "Almohadones",
    "Colchón Desmontable Redondo",
    "Colchoneta Desmontable",
  ];
  const TAMANO_ORDEN = ["XS", "S", "M", "L", "XL"];

  function ordenTamanos(lista) {
    return lista
      .slice()
      .sort((a, b) => TAMANO_ORDEN.indexOf(a) - TAMANO_ORDEN.indexOf(b));
  }

  function categoriasDisponibles() {
    const set = new Set(PRODUCTS.map((p) => p.categoria));
    return CATEGORIA_ORDEN.filter((c) => set.has(c));
  }

  function tamanosDisponibles() {
    const set = new Set();
    PRODUCTS.forEach((p) => p.tamanos.forEach((t) => set.add(t.nombre)));
    return ordenTamanos(Array.from(set));
  }

  function precioUnitarioTamano(tamano, modo) {
    return modo === "mayorista" ? tamano.mayorista : tamano.minorista;
  }

  function precioDesde(product, modo) {
    return Math.min(...product.tamanos.map((t) => precioUnitarioTamano(t, modo)));
  }

  function precioProducto(product) {
    return Math.min(...product.tamanos.map((t) => t.minorista));
  }

  /* ---------- Estado ---------- */
  const CART_KEY = "lulu:cart:v1";
  const PROMO_KEY = "lulu:first-purchase-redeemed:v2";

  function promoActiva() {
    if (!CONFIG.PRIMERA_COMPRA?.ACTIVO) return false;
    try {
      return !localStorage.getItem(PROMO_KEY);
    } catch (e) {
      return true;
    }
  }

  function calcularDescuento(total) {
    if (!promoActiva() || state.modo === "mayorista") return 0;
    return Math.round(total * (CONFIG.PRIMERA_COMPRA.DESCUENTO_PCT / 100));
  }

  function calcularDescuentoSegundaUnidad() {
    if (state.modo === "mayorista" || !CONFIG.SEGUNDA_UNIDAD?.ACTIVO) return 0;
    const unidades = [];
    state.cart.forEach((item) => {
      const precio = precioUnitarioItem(item, state.modo);
      for (let i = 0; i < item.cantidad; i++) unidades.push(precio);
    });
    if (unidades.length < 2) return 0;
    const segunda = [...unidades].sort((a, b) => a - b)[0];
    return Math.round(segunda * (CONFIG.SEGUNDA_UNIDAD.DESCUENTO_PCT / 100));
  }

  function calcularEnvio(cliente) {
    if (promoActiva() && CONFIG.PRIMERA_COMPRA.ENVIO_GRATIS && cliente && cliente.entrega === "envio") return 0;
    return null;
  }

  function totalConPromo() {
    const subtotal = totalCarrito();
    return Math.max(0, subtotal - calcularDescuento(subtotal) - calcularDescuentoSegundaUnidad());
  }

  const state = {
    modo: "minorista", // "minorista" | "mayorista"
    filtroCategoria: null,
    filtroTamano: null,
    orden: "destacados",
    cart: cargarCarrito(),
    currentProduct: null,
    currentImgIndex: 0,
    currentColorIndex: 0,
    currentTelaIndex: 0,
    currentSizeIndex: -1,
    lightboxScale: 1,
    lightboxPos: { x: 0, y: 0 },
  };

  function cargarCarrito() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function guardarCarrito() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    } catch (e) {
      /* localStorage no disponible: el carrito no persiste, pero no rompe la página */
    }
  }

  /* ---------- Analytics ---------- */
  function analyticsIdValido(id, prefix) {
    return typeof id === "string" && id.trim().toUpperCase().startsWith(prefix) && id.trim().length > prefix.length + 2;
  }

  function trackEvent(name, params) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params || {});
      }
    } catch (e) {}
    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push(Object.assign({ event: name }, params || {}));
      }
    } catch (e) {}
    try {
      if (typeof window.fbq === "function") {
        const metaParams = params || {};
        const metaEvents = {
          view_item: "ViewContent",
          add_to_cart: "AddToCart",
          begin_checkout: "InitiateCheckout",
          click_whatsapp: "Contact",
          generate_lead: "Lead",
        };
        const metaName = metaEvents[name];
        if (metaName) window.fbq("track", metaName, metaParams);
      }
    } catch (e) {}
  }

  function setupMetaPixel() {
    const id = String(CONFIG?.ANALYTICS?.META_PIXEL_ID || "").trim();
    if (!/^\d{5,20}$/.test(id)) return;

    if (typeof window.fbq !== "function") {
      !(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,"script",
        "https://connect.facebook.net/en_US/fbevents.js");
    }

    window.fbq("init", id);
    window.fbq("track", "PageView");
  }

  function setupAnalytics() {
    const cfg = CONFIG.ANALYTICS;
    if (!cfg || cfg.ACTIVO === false) return;

    if (analyticsIdValido(cfg.GA4_MEASUREMENT_ID, "G-")) {
      const id = cfg.GA4_MEASUREMENT_ID.trim();
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", id, { send_page_view: true });
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      document.head.appendChild(script);
    }

    if (analyticsIdValido(cfg.GTM_CONTAINER_ID, "GTM-")) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.GTM_CONTAINER_ID.trim());
      document.head.appendChild(script);
    }
  }

  /* ---------- WhatsApp ---------- */
  function buildWaLink(texto) {
    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
  }

  function abrirWhatsApp(texto) {
    return window.open(buildWaLink(texto), "_blank", "noopener");
  }

  function mensajeProducto(product, opts) {
    opts = opts || {};
    let msg = `Hola! Quería consultar por ${product.nombre}`;
    if (opts.talle) msg += `, talle ${opts.talle}`;
    if (opts.color) msg += `, color ${opts.color}`;
    msg += ".";
    return msg;
  }

  function mensajePedido(cart, cliente) {
    const lineas = cart.map((item) => {
      const precio = precioUnitarioItem(item, state.modo);
      const detalle = [item.colorNombre, item.talle ? `Talle ${item.talle}` : null]
        .filter(Boolean)
        .join(" · ");
      return `• ${item.cantidad}x ${item.nombre}${detalle ? " (" + detalle + ")" : ""} — ${formatPrice(precio * item.cantidad)}`;
    });
    const subtotal = totalCarrito();
    const descuento = calcularDescuento(subtotal);
    const descuentoSegunda = calcularDescuentoSegundaUnidad();
    const envioGratis = promoActiva() && CONFIG.PRIMERA_COMPRA.ENVIO_GRATIS && cliente.entrega === "envio";
    const total = Math.max(0, subtotal - descuento - descuentoSegunda);

    let msg = `Hola! Quiero hacer este pedido en Lulú Lulú${state.modo === "mayorista" ? " (mayorista)" : ""}:\n\n`;
    msg += lineas.join("\n");
    msg += `\n\nSubtotal: ${formatPrice(subtotal)}`;
    if (descuento > 0) msg += `\n15% OFF primera compra: -${formatPrice(descuento)}`;
    if (descuentoSegunda > 0) msg += `\n50% OFF segunda unidad: -${formatPrice(descuentoSegunda)}`;
    if (envioGratis) msg += `\nEnvío: GRATIS (primera compra)`;
    msg += `\nTotal: ${formatPrice(total)}`;
    msg += `\nMedio de pago: ${cliente.pago}`;
    msg += `\n\nNombre: ${cliente.nombre}`;
    msg += `\nTeléfono: ${cliente.telefono}`;
    msg += `\nEntrega: ${cliente.entrega === "envio" ? "Envío a domicilio" : "Retiro"}`;
    if (cliente.entrega === "envio") {
      msg += `\nDirección: ${cliente.direccion}, ${cliente.localidad}`;
    }
    if (cliente.observaciones) {
      msg += `\nObservaciones: ${cliente.observaciones}`;
    }
    return msg;
  }

  function precioUnitarioItem(item, modo) {
    return modo === "mayorista" ? item.precioMayorista : item.precioMinorista;
  }

  function totalUnidades() {
    return state.cart.reduce((acc, it) => acc + it.cantidad, 0);
  }

  function totalCarrito() {
    return state.cart.reduce(
      (acc, it) => acc + it.cantidad * precioUnitarioItem(it, state.modo),
      0
    );
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function showToast(msg) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  }

  /* ---------- Diálogos ---------- */
  function abrirDialogo(dialog) {
    if (!dialog || typeof dialog.showModal !== "function" || dialog.open) return;
    dialog.showModal();
    lockBodyScroll();
    if (dialog.classList.contains("drawer")) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => dialog.classList.add("is-open"));
      });
    }
  }
  function cerrarDialogo(dialog) {
    if (!dialog || !dialog.open) return;
    if (dialog.classList.contains("drawer") && dialog.classList.contains("is-open")) {
      dialog.classList.remove("is-open");
      const cerrarYa = () => {
        dialog.removeEventListener("transitionend", onEnd);
        clearTimeout(fallback);
        if (dialog.open) dialog.close();
      };
      const onEnd = (e) => {
        if (e.target === dialog) cerrarYa();
      };
      dialog.addEventListener("transitionend", onEnd);
      const fallback = setTimeout(cerrarYa, 400);
      return;
    }
    dialog.close();
  }

  let scrollLockY = 0;
  function lockBodyScroll() {
    if (document.body.classList.contains("no-scroll")) return;
    scrollLockY = window.scrollY;
    document.body.classList.add("no-scroll");
    document.body.style.top = `-${scrollLockY}px`;
  }
  function unlockBodyScroll() {
    if (!document.body.classList.contains("no-scroll")) return;
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo({ top: scrollLockY, behavior: "instant" });
  }
  function actualizarBloqueoScroll() {
    const hayAbierto = $$("dialog").some((d) => d.open);
    if (hayAbierto) lockBodyScroll();
    else unlockBodyScroll();
  }

  function setupDialogs() {
    $$("dialog").forEach((dialog) => {
      on(dialog, "click", (e) => {
        if (e.target === dialog) cerrarDialogo(dialog);
      });
      on(dialog, "close", actualizarBloqueoScroll);
      if (dialog.classList.contains("drawer")) {
        on(dialog, "cancel", (e) => {
          e.preventDefault();
          cerrarDialogo(dialog);
        });
      }
    });
    on(document, "click", (e) => {
      const closeBtn = e.target.closest("[data-close]");
      if (closeBtn) {
        const dialog = closeBtn.closest("dialog");
        if (dialog) cerrarDialogo(dialog);
      }
    });
    on($("#zoomDialog"), "close", () => {
      resetZoom();
    });
  }

  /* ---------- Barra de progreso + header ---------- */
  function setupScrollProgress() {
    const bar = $("#progress");
    if (!bar) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    on(window, "scroll", update, { passive: true });
    on(window, "resize", update);
    update();
  }

  function setupHeaderShadow() {
    const header = $(".site-header");
    if (!header) return;
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    on(window, "scroll", update, { passive: true });
    update();
  }

  /* ---------- Mobile menu ---------- */
  function setupMobileMenu() {
    const btn = $("#mobileMenuToggle");
    const menu = $("#mobileMenu");
    if (!btn || !menu) return;
    const close = () => {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };
    on(btn, "click", () => {
      const open = menu.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    $$("a", menu).forEach((a) => on(a, "click", close));
  }

  /* ---------- Reveal ---------- */
  function setupReveal() {
    const items = $$('[data-reveal]');
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  function setupCountUp() {
    const items = $$('[data-count]');
    if (!items.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count) || 0;
        const start = performance.now();
        const duration = 700;
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("es-AR");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.7 });
    items.forEach((el) => io.observe(el));
  }

  function setupWaTriggers() {
    $$('[data-wa]').forEach((el) => {
      on(el, "click", () => {
        const msg = el.dataset.wa || CONFIG.MENSAJES.consulta;
        trackEvent("click_whatsapp", { source: el.dataset.source || "unknown" });
        abrirWhatsApp(msg);
      });
    });
  }

  function setupModeSwitch() {
    $$('input[name="modo"]', document).forEach((input) => {
      on(input, "change", () => {
        if (!input.checked) return;
        state.modo = input.value;
        renderGrid();
        actualizarCarritoUI();
      });
    });
  }

  /* ---------- Catalog controls ---------- */
  function setupCatalogoControles() {
    const cat = $("#filtroCategoria");
    const size = $("#filtroTamano");
    if (cat) {
      cat.innerHTML = '<option value="">Todas las categorías</option>' + categoriasDisponibles().map(c => `<option value="${c}">${c}</option>`).join("");
      on(cat, "change", () => { state.filtroCategoria = cat.value || null; renderGrid(); });
    }
    if (size) {
      size.innerHTML = '<option value="">Todos los tamaños</option>' + tamanosDisponibles().map(t => `<option value="${t}">${t}</option>`).join("");
      on(size, "change", () => { state.filtroTamano = size.value || null; renderGrid(); });
    }
    const sort = $("#ordenCatalogo");
    if (sort) on(sort, "change", () => { state.orden = sort.value || "destacados"; renderGrid(); });
  }

  /* ---------- Modal ---------- */
  function abrirZoom(src, titulo) {
    $("#zTitle").textContent = titulo || "";
    resetZoom();
    renderZoomImagen(src);
    abrirDialogo($("#zoomDialog"));
  }

  function renderZoomImagen(src) {
    const img = $("#zImg");
    if (src) img.src = src;
    else if (state.currentProduct) img.src = state.currentProduct.imagenes[state.currentImgIndex];
  }

  function resetZoom() {
    state.lightboxScale = 1;
    state.lightboxPos = { x: 0, y: 0 };
    aplicarZoom();
  }

  function aplicarZoom() {
    const img = $("#zImg");
    if (!img) return;
    img.style.transform = `translate(${state.lightboxPos.x}px, ${state.lightboxPos.y}px) scale(${state.lightboxScale})`;
    img.style.cursor = state.lightboxScale > 1 ? "grab" : "zoom-in";
  }

  function setZoom(delta) {
    state.lightboxScale = Math.min(4, Math.max(1, state.lightboxScale + delta));
    if (state.lightboxScale === 1) state.lightboxPos = { x: 0, y: 0 };
    aplicarZoom();
  }

  function setupZoomControles() {
    on($("#zIn"), "click", () => setZoom(0.5));
    on($("#zOut"), "click", () => setZoom(-0.5));
    on($("#zReset"), "click", resetZoom);
    on($("#zPrev"), "click", () => cambiarImagen(-1));
    on($("#zNext"), "click", () => cambiarImagen(1));
    on($("#zImg"), "dblclick", () => setZoom(state.lightboxScale > 1 ? -3 : 2));

    const stage = $("#zStage");
    let arrastrando = false;
    let origen = { x: 0, y: 0 };
    let posInicial = { x: 0, y: 0 };

    on(stage, "pointerdown", (e) => {
      if (state.lightboxScale <= 1) return;
      arrastrando = true;
      origen = { x: e.clientX, y: e.clientY };
      posInicial = { ...state.lightboxPos };
      stage.setPointerCapture(e.pointerId);
    });
    on(stage, "pointermove", (e) => {
      if (!arrastrando) return;
      state.lightboxPos = {
        x: posInicial.x + (e.clientX - origen.x),
        y: posInicial.y + (e.clientY - origen.y),
      };
      aplicarZoom();
    });
    on(stage, "pointerup", () => { arrastrando = false; });
    on(stage, "pointercancel", () => { arrastrando = false; });
  }

  /* ---------- Producto estrella ---------- */
  function injectPaymentOptions() {
    const form = $("#checkoutForm .drawer__body");
    if (!form || $("#fPago")) return;
    const wrap = document.createElement("div");
    wrap.className = "field promo-payment-field";
    wrap.innerHTML = `<label for="fPago">¿Cómo querés pagar?</label><select id="fPago" name="pago"><option value="Mercado Pago">Mercado Pago</option><option value="Transferencia bancaria">Transferencia bancaria</option></select>`;
    const obs = $("#fObs");
    const obsField = obs ? obs.closest(".field") : null;
    if (obsField) obsField.before(wrap); else form.appendChild(wrap);
  }

  function setupPromocion() {
    if (!CONFIG.PRIMERA_COMPRA?.ACTIVO && !CONFIG.SEGUNDA_UNIDAD?.ACTIVO) return;
    const pop = document.createElement("aside");
    pop.className = "promo-popout";
    pop.innerHTML = `
      <button class="promo-popout__close" type="button" aria-label="Cerrar promociones">×</button>
      <div class="promo-popout__eyebrow">PROMOS LULÚ</div>
      <strong>15% OFF + envío gratis</strong>
      <span>Primera compra</span>
      <div class="promo-popout__divider"></div>
      <strong>50% OFF</strong>
      <span>segunda unidad en el mismo pedido</span>
      <a class="btn btn--primary" href="#promociones">Ver promociones</a>
    `;
    document.body.appendChild(pop);
    on(pop.querySelector(".promo-popout__close"), "click", () => {
      pop.classList.add("is-hidden");
      try { sessionStorage.setItem("lulu:promo-popout-closed:v1", "1"); } catch (e) {}
    });
    on(pop.querySelector("a"), "click", () => pop.classList.add("is-hidden"));
    try {
      if (sessionStorage.getItem("lulu:promo-popout-closed:v1") === "1") pop.classList.add("is-hidden");
    } catch (e) {}
  }

  function setupEstrella() {
    const cfg = CONFIG.PRODUCTO_ESTRELLA;
    const section = $("#estrella");
    if (!cfg || !cfg.ACTIVO || !section || !promoActiva()) {
      if (section) section.hidden = true;
      return;
    }
    const product = PRODUCTS.find((p) => p.id === cfg.PRODUCTO_ID);
    if (!product) return;
    const old = precioProducto(product);
    const promo = Math.round(old * (1 - cfg.DESCUENTO_PCT / 100));
    $$('[data-star="old"]').forEach((el) => (el.textContent = formatPrice(old)));
    $$('[data-star="promo"]').forEach((el) => (el.textContent = formatPrice(promo)));
    $$('[data-star="pct"]').forEach((el) => (el.textContent = String(cfg.DESCUENTO_PCT)));
    $$('[data-star-open]').forEach((btn) => on(btn, "click", () => openProductModal(product.id)));
    section.hidden = false;
  }

  /* ---------- Inicio ---------- */
  function init() {
    setupAnalytics();
    setupMetaPixel();
    setupContexto();
    setupPromocion();
    setupDialogs();
    setupScrollProgress();
    setupHeaderShadow();
    setupMobileMenu();
    setupReveal();
    setupCountUp();
    setupWaTriggers();
    setupModeSwitch();
    setupCatalogoControles();
    setupModalControles();
    setupGalleryZoom();
    setupZoomControles();
    setupCarrito();
    setupCheckoutForm();
    setupEstrella();

    renderChips();
    renderGrid();
    actualizarCarritoUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
