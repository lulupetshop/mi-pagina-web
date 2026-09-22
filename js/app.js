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
  const PROMO_KEY = "lulu:first-purchase-redeemed:v1";

  function promoActiva() {
    return Boolean(CONFIG.PRIMERA_COMPRA && CONFIG.PRIMERA_COMPRA.ACTIVO && !localStorage.getItem(PROMO_KEY));
  }

  function calcularDescuento(total) {
    if (!promoActiva() || state.modo === "mayorista") return 0;
    return Math.round(total * (CONFIG.PRIMERA_COMPRA.DESCUENTO_PCT / 100));
  }

  function calcularEnvio(cliente) {
    if (promoActiva() && CONFIG.PRIMERA_COMPRA.ENVIO_GRATIS && cliente && cliente.entrega === "envio") return 0;
    return null;
  }

  function totalConPromo() {
    return Math.max(0, totalCarrito() - calcularDescuento(totalCarrito()));
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
    const envioGratis = promoActiva() && CONFIG.PRIMERA_COMPRA.ENVIO_GRATIS && cliente.entrega === "envio";
    const total = Math.max(0, subtotal - descuento);

    let msg = `Hola! Quiero hacer este pedido en Lulú Lulú${state.modo === "mayorista" ? " (mayorista)" : ""}:\n\n`;
    msg += lineas.join("\n");
    msg += `\n\nSubtotal: ${formatPrice(subtotal)}`;
    if (descuento > 0) msg += `\n15% OFF primera compra: -${formatPrice(descuento)}`;
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
      // Doble rAF: asegura que el navegador ya pintó el estado inicial
      // (fuera de pantalla) antes de agregar la clase que dispara la
      // transición, si no el <dialog> aparece directamente en su
      // posición final sin deslizarse.
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

  // Evita que, con un diálogo abierto, el gesto de scroll se vaya al fondo
  // de la página en lugar de mover el contenido del modal. Se re-evalúa en
  // el evento "close" (nativo) de cada dialog para cubrir también el cierre
  // con Escape, que no pasa por cerrarDialogo().
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
        // Sin esto, Escape cierra el <dialog> de forma nativa e
        // instantánea, sin pasar por cerrarDialogo() ni animar la salida.
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
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + "%";
    };
    on(window, "scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupHeaderShadow() {
    const header = $("#siteHeader");
    if (!header) return;
    const onScroll = () => {
      const scrolled = window.scrollY > 40;
      header.classList.toggle("is-scrolled", scrolled);
      header.style.boxShadow = scrolled ? "0 8px 24px rgba(36,21,57,.08)" : "none";
    };
    on(window, "scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menú móvil ---------- */
  function setupMobileMenu() {
    const menuBtn = $("#menuBtn");
    const nav = $("#nav");
    if (!menuBtn || !nav) return;

    function cerrar() {
      menuBtn.setAttribute("aria-expanded", "false");
    }
    function abrir() {
      menuBtn.setAttribute("aria-expanded", "true");
    }

    on(menuBtn, "click", () => {
      const expanded = menuBtn.getAttribute("aria-expanded") === "true";
      expanded ? cerrar() : abrir();
    });
    on(nav, "click", (e) => {
      if (e.target.closest("a")) cerrar();
    });
    on(document, "keydown", (e) => {
      if (e.key === "Escape") cerrar();
    });
    on(document, "click", (e) => {
      const dentro = e.target.closest("#nav") || e.target.closest("#menuBtn");
      if (!dentro && menuBtn.getAttribute("aria-expanded") === "true") cerrar();
    });
  }

  /* ---------- Reveal + contadores ---------- */
  function setupReveal() {
    if (!("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    $$(".reveal").forEach((el) => obs.observe(el));
  }

  function setupCountUp() {
    if (!("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const dur = 900;
          const start = performance.now();
          function tick(now) {
            const p = Math.min(1, (now - start) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
          }
          requestAnimationFrame(tick);
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    $$("[data-count]").forEach((el) => obs.observe(el));
  }

  /* ---------- WhatsApp global (data-wa) ---------- */
  function setupWaTriggers() {
    on(document, "click", (e) => {
      const el = e.target.closest("[data-wa]");
      if (!el) return;
      e.preventDefault();
      const tipo = el.dataset.wa;
      const texto = CONFIG.MENSAJES[tipo] || CONFIG.MENSAJES.consulta;
      abrirWhatsApp(texto);
    });

    const waText = $("#footerContact [data-wa-text]");
    if (waText) waText.textContent = "+" + CONFIG.WHATSAPP_NUMBER;
  }

  /* ---------- Datos de contexto (demo, año, mínimo mayorista) ---------- */
  function setupContexto() {
    if (CONFIG.MODO_EJEMPLO) {
      const bar = $("#demoBar");
      if (bar) bar.hidden = false;
    }
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    $$("[data-mayo-min]").forEach((el) => {
      el.textContent = CONFIG.MAYORISTA_MIN_UNIDADES;
    });
    const pMayoMin = $("#pMayoMin");
    if (pMayoMin) pMayoMin.textContent = CONFIG.MAYORISTA_MIN_UNIDADES;
  }

  /* ---------- Modo minorista / mayorista ---------- */
  function setModo(modo) {
    state.modo = modo;
    $$(".mode__btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.mode === modo));
    });
    const note = $("#mayoNote");
    if (note) note.hidden = modo !== "mayorista";
    renderGrid();
    if (state.currentProduct) actualizarPrecioModal();
    actualizarCarritoUI();
  }

  function setupModeSwitch() {
    $$(".mode__btn").forEach((btn) => {
      on(btn, "click", () => setModo(btn.dataset.mode));
    });
    $$("[data-set-mode]").forEach((el) => {
      on(el, "click", () => setModo(el.dataset.setMode));
    });
  }

  /* ---------- Filtros y catálogo ---------- */
  function renderChips() {
    const chipsCat = $("#chipsCat");
    const chipsSize = $("#chipsSize");
    if (chipsCat) {
      chipsCat.innerHTML = "";
      chipsCat.appendChild(crearChip("Todas", state.filtroCategoria === null, () => {
        state.filtroCategoria = null;
        renderChips();
        renderGrid();
      }));
      categoriasDisponibles().forEach((cat) => {
        chipsCat.appendChild(
          crearChip(cat, state.filtroCategoria === cat, () => {
            state.filtroCategoria = state.filtroCategoria === cat ? null : cat;
            renderChips();
            renderGrid();
          })
        );
      });
    }
    if (chipsSize) {
      chipsSize.innerHTML = "";
      chipsSize.appendChild(crearChip("Todos", state.filtroTamano === null, () => {
        state.filtroTamano = null;
        renderChips();
        renderGrid();
      }));
      tamanosDisponibles().forEach((t) => {
        chipsSize.appendChild(
          crearChip(t, state.filtroTamano === t, () => {
            state.filtroTamano = state.filtroTamano === t ? null : t;
            renderChips();
            renderGrid();
          })
        );
      });
    }
  }

  function crearChip(label, activo, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.setAttribute("aria-pressed", String(activo));
    on(btn, "click", onClick);
    return btn;
  }

  function productosFiltrados() {
    let lista = PRODUCTS.filter((p) => {
      if (state.filtroCategoria && p.categoria !== state.filtroCategoria) return false;
      if (state.filtroTamano && !p.tamanos.some((t) => t.nombre === state.filtroTamano)) return false;
      return true;
    });

    if (state.orden === "precio-asc") {
      lista = lista.slice().sort((a, b) => precioDesde(a, state.modo) - precioDesde(b, state.modo));
    } else if (state.orden === "precio-desc") {
      lista = lista.slice().sort((a, b) => precioDesde(b, state.modo) - precioDesde(a, state.modo));
    } else {
      lista = lista.slice().sort((a, b) => {
        const aEst = CONFIG.PRODUCTO_ESTRELLA.ACTIVO && a.id === CONFIG.PRODUCTO_ESTRELLA.PRODUCTO_ID ? -1 : 0;
        const bEst = CONFIG.PRODUCTO_ESTRELLA.ACTIVO && b.id === CONFIG.PRODUCTO_ESTRELLA.PRODUCTO_ID ? -1 : 0;
        return aEst - bEst;
      });
    }
    return lista;
  }

  function renderGrid() {
    const grid = $("#grid");
    const results = $("#results");
    if (!grid) return;
    const lista = productosFiltrados();

    grid.innerHTML = "";
    lista.forEach((product) => {
      grid.appendChild(crearCard(product));
    });

    if (results) {
      results.textContent =
        lista.length === 0
          ? "No encontramos modelos con esos filtros."
          : `${lista.length} modelo${lista.length === 1 ? "" : "s"} disponible${lista.length === 1 ? "" : "s"}`;
    }
  }

  function crearCard(product) {
    const article = document.createElement("article");
    article.className = "card";
    article.tabIndex = 0;
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", "Ver " + product.nombre);

    const img = document.createElement("img");
    img.src = product.imagenes[0];
    img.alt = product.nombre;
    img.loading = "lazy";
    img.width = 900;
    img.height = 765;
    article.appendChild(img);

    if (CONFIG.MODO_EJEMPLO) {
      const badge = document.createElement("span");
      badge.className = "badge badge--float";
      badge.textContent = "Ejemplo";
      article.appendChild(badge);
    }

    const body = document.createElement("div");
    body.className = "card__body";

    const cat = document.createElement("p");
    cat.className = "card__cat";
    cat.textContent = product.categoria;

    const title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = product.nombre;

    const price = document.createElement("p");
    price.className = "card__price";
    price.innerHTML = `${formatPrice(precioDesde(product, state.modo))} <span class="card__price-note">desde</span>`;

    body.append(cat, title, price);
    article.appendChild(body);

    const abrir = () => openProductModal(product.id);
    on(article, "click", abrir);
    on(article, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
    });

    return article;
  }

  function setupCatalogoControles() {
    const sortSel = $("#sortSel");
    if (sortSel) {
      on(sortSel, "change", () => {
        state.orden = sortSel.value;
        renderGrid();
      });
    }
    $$(".tile[data-cat]").forEach((tile) => {
      on(tile, "click", () => {
        state.filtroCategoria = tile.dataset.cat;
        renderChips();
        renderGrid();
      });
    });
  }

  /* ---------- Modal de producto ---------- */
  function openProductModal(id) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    state.currentProduct = product;
    state.currentImgIndex = 0;
    state.currentColorIndex = 0;
    state.currentTelaIndex = 0;
    state.currentSizeIndex = -1;

    $("#pCat").textContent = product.categoria;
    $("#pTitle").textContent = product.nombre;
    $("#pDesc").textContent = product.descripcion;

    const badge = $("#pBadge");
    if (badge) badge.hidden = !CONFIG.MODO_EJEMPLO;

    renderGaleria();
    renderColores();
    renderTelas();
    renderTamanos();
    renderTablaTamanos();
    actualizarPrecioModal();

    $("#pQty").textContent = "1";
    $("#pSizeError").hidden = true;
    $("#pTelaError").hidden = true;

    abrirDialogo($("#productDialog"));
  }

  function renderGaleria() {
    const product = state.currentProduct;
    const mainImg = $("#pMainImg");
    const thumbs = $("#pThumbs");
    mainImg.src = product.imagenes[state.currentImgIndex];
    mainImg.alt = product.nombre;

    thumbs.innerHTML = "";
    product.imagenes.forEach((src, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(i === state.currentImgIndex));
      btn.setAttribute("aria-label", `Foto ${i + 1} de ${product.nombre}`);
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      btn.appendChild(img);
      on(btn, "click", () => {
        state.currentImgIndex = i;
        renderGaleria();
      });
      thumbs.appendChild(btn);
    });

    const multiple = product.imagenes.length > 1;
    $("#pPrev").hidden = !multiple;
    $("#pNext").hidden = !multiple;
  }

  function cambiarImagen(delta) {
    const product = state.currentProduct;
    if (!product) return;
    const n = product.imagenes.length;
    state.currentImgIndex = (state.currentImgIndex + delta + n) % n;
    renderGaleria();
    if ($("#zoomDialog").open) renderZoomImagen();
  }

  function renderColores() {
    const product = state.currentProduct;
    const colores = product.colores || [];
    const wrap = $("#pColors");
    const set = $("#pColorSet");
    const note = $("#pColorNote");
    wrap.innerHTML = "";

    if (colores.length === 0) {
      set.hidden = true;
      note.hidden = false;
      return;
    }
    set.hidden = false;
    note.hidden = true;

    colores.forEach((color, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.setProperty("--sw", color.hex);
      btn.setAttribute("aria-pressed", String(i === state.currentColorIndex));
      btn.setAttribute("aria-label", color.nombre);
      on(btn, "click", () => {
        state.currentColorIndex = i;
        renderColores();
        actualizarPrecioModal();
      });
      wrap.appendChild(btn);
    });
    $("#pColorName").textContent = colores[state.currentColorIndex].nombre;
  }

  function renderTelas() {
    const product = state.currentProduct;
    const telas = product.telas || [];
    const set = $("#pTelaSet");
    const wrap = $("#pTelas");
    wrap.innerHTML = "";

    if (telas.length === 0) {
      set.hidden = true;
      return;
    }
    set.hidden = false;

    telas.forEach((tela, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = tela;
      btn.setAttribute("aria-pressed", String(i === state.currentTelaIndex));
      on(btn, "click", () => {
        state.currentTelaIndex = i;
        renderTelas();
        $("#pTelaError").hidden = true;
      });
      wrap.appendChild(btn);
    });
  }

  function renderTamanos() {
    const product = state.currentProduct;
    const wrap = $("#pSizes");
    wrap.innerHTML = "";

    ordenTamanos(product.tamanos.map((t) => t.nombre)).forEach((nombre) => {
      const i = product.tamanos.findIndex((t) => t.nombre === nombre);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = nombre;
      btn.setAttribute("aria-pressed", String(i === state.currentSizeIndex));
      on(btn, "click", () => {
        state.currentSizeIndex = i;
        renderTamanos();
        renderTablaTamanos();
        actualizarPrecioModal();
        $("#pSizeError").hidden = true;
      });
      wrap.appendChild(btn);
    });
  }

  function renderTablaTamanos() {
    const product = state.currentProduct;
    const tbody = $("#pTable tbody");
    tbody.innerHTML = "";
    product.tamanos.forEach((t, i) => {
      const tr = document.createElement("tr");
      if (i === state.currentSizeIndex) tr.classList.add("is-selected");
      tr.innerHTML = `<td>${t.nombre}</td><td>${t.medida}</td><td>${t.recomendado}</td>`;
      tbody.appendChild(tr);
    });
  }

  function actualizarPrecioModal() {
    const product = state.currentProduct;
    const pPrice = $("#pPrice");
    const pMayo = $("#pMayo");
    const seleccion = state.currentSizeIndex >= 0 ? product.tamanos[state.currentSizeIndex] : null;

    if (seleccion) {
      pPrice.textContent = formatPrice(precioUnitarioTamano(seleccion, state.modo));
    } else {
      pPrice.textContent = `Desde ${formatPrice(precioDesde(product, state.modo))}`;
    }
    pMayo.hidden = state.modo !== "mayorista";

    const color = product.colores && product.colores[state.currentColorIndex];
    const tela = product.telas && product.telas[state.currentTelaIndex];
    $("#pAsk").href = buildWaLink(
      mensajeProducto(product, {
        talle: seleccion ? seleccion.nombre : null,
        color: [color && color.nombre, tela].filter(Boolean).join(" / ") || null,
      })
    );
  }

  /* ---------- Zoom dinámico (lupa con el mouse, para ver la textura) ---------- */
  function setupGalleryZoom() {
    const main = $("#pMain");
    const img = $("#pMainImg");
    if (!main || !img) return;

    const puedeHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!puedeHover) return; // en touch se usa "Ver de cerca" (pellizcar para acercar)

    const hint = document.createElement("span");
    hint.className = "zoom-hint";
    hint.textContent = "Pasá el mouse para ver la textura";
    main.appendChild(hint);

    on(main, "mousemove", (e) => {
      const rect = img.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = "scale(2.4)";
      main.classList.add("is-zooming");
    });
    on(main, "mouseleave", () => {
      img.style.transform = "";
      img.style.transformOrigin = "";
      main.classList.remove("is-zooming");
    });
  }

  function setupModalControles() {
    on($("#pPrev"), "click", () => cambiarImagen(-1));
    on($("#pNext"), "click", () => cambiarImagen(1));

    on($("#pZoom"), "click", () => {
      abrirZoom(state.currentProduct.imagenes[state.currentImgIndex], state.currentProduct.nombre);
    });

    on($("#pQtyMinus"), "click", () => {
      const el = $("#pQty");
      const val = Math.max(1, parseInt(el.textContent, 10) - 1);
      el.textContent = String(val);
    });
    on($("#pQtyPlus"), "click", () => {
      const el = $("#pQty");
      const val = Math.min(99, parseInt(el.textContent, 10) + 1);
      el.textContent = String(val);
    });

    on($("#pAdd"), "click", () => {
      const product = state.currentProduct;
      if (!product) return;

      if (product.telas && product.telas.length && state.currentTelaIndex < 0) {
        $("#pTelaError").hidden = false;
        return;
      }
      if (state.currentSizeIndex < 0) {
        $("#pSizeError").hidden = false;
        $("#pSizeSet").scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      const tamano = product.tamanos[state.currentSizeIndex];
      const color = product.colores && product.colores[state.currentColorIndex];
      const tela = product.telas && product.telas[state.currentTelaIndex];
      const cantidad = parseInt($("#pQty").textContent, 10) || 1;

      agregarAlCarrito({
        productId: product.id,
        nombre: product.nombre,
        categoria: product.categoria,
        imagen: product.imagenes[0],
        colorNombre: [color && color.nombre, tela].filter(Boolean).join(" / ") || null,
        talle: tamano.nombre,
        precioMinorista: tamano.minorista,
        precioMayorista: tamano.mayorista,
        cantidad,
      });

      showToast(`Se agregó ${product.nombre} al carrito`);
      cerrarDialogo($("#productDialog"));
    });
  }

  /* ---------- Carrito ---------- */
  function agregarAlCarrito(item) {
    const existente = state.cart.find(
      (it) =>
        it.productId === item.productId &&
        it.talle === item.talle &&
        it.colorNombre === item.colorNombre
    );
    if (existente) {
      existente.cantidad += item.cantidad;
    } else {
      state.cart.push(item);
    }
    guardarCarrito();
    actualizarCarritoUI();
  }

  function cambiarCantidad(index, delta) {
    const item = state.cart[index];
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      state.cart.splice(index, 1);
    }
    guardarCarrito();
    actualizarCarritoUI();
  }

  function quitarDelCarrito(index) {
    state.cart.splice(index, 1);
    guardarCarrito();
    actualizarCarritoUI();
  }

  function actualizarCarritoUI() {
    const count = $("#cartCount");
    const unidades = totalUnidades();
    if (count) count.textContent = String(unidades);
    $("#cartBtn").setAttribute(
      "aria-label",
      unidades > 0 ? `Abrir carrito, ${unidades} unidades` : "Abrir carrito, vacío"
    );

    const list = $("#cartList");
    const empty = $("#cartEmpty");
    const foot = $("#cartFoot");
    if (!list) return;

    list.innerHTML = "";
    if (state.cart.length === 0) {
      empty.hidden = false;
      foot.hidden = true;
    } else {
      empty.hidden = true;
      foot.hidden = false;
      state.cart.forEach((item, index) => {
        list.appendChild(crearItemCarrito(item, index));
      });
    }

    $("#cartSubtotal").textContent = formatPrice(totalCarrito());
    const discount = calcularDescuento(totalCarrito());
    const promoRow = $("#cartPromo");
    if (promoRow) {
      promoRow.hidden = discount <= 0;
      const value = $("#cartDiscount");
      if (value) value.textContent = `-${formatPrice(discount)}`;
    }
    $("#cartTotal").textContent = formatPrice(totalConPromo());

    actualizarNoticiasMayorista();
  }

  function crearItemCarrito(item, index) {
    const li = document.createElement("li");

    const img = document.createElement("img");
    img.src = item.imagen;
    img.alt = "";

    const body = document.createElement("div");
    body.className = "cart-item__body";
    const title = document.createElement("b");
    title.textContent = item.nombre;
    const meta = document.createElement("div");
    meta.className = "cart-item__meta";
    meta.textContent = [item.colorNombre, item.talle ? `Talle ${item.talle}` : null]
      .filter(Boolean)
      .join(" · ");

    const qty = document.createElement("div");
    qty.className = "cart-item__qty";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty__btn";
    minus.setAttribute("aria-label", "Restar una unidad");
    minus.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-minus"/></svg>';
    on(minus, "click", () => cambiarCantidad(index, -1));

    const span = document.createElement("span");
    span.textContent = String(item.cantidad);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty__btn";
    plus.setAttribute("aria-label", "Sumar una unidad");
    plus.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg>';
    on(plus, "click", () => cambiarCantidad(index, 1));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-item__remove";
    remove.textContent = "Quitar";
    on(remove, "click", () => quitarDelCarrito(index));

    qty.append(minus, span, plus, remove);
    body.append(title, meta, qty);

    const price = document.createElement("div");
    price.className = "cart-item__price";
    price.textContent = formatPrice(precioUnitarioItem(item, state.modo) * item.cantidad);

    li.append(img, body, price);
    return li;
  }

  function actualizarNoticiasMayorista() {
    const notice = $("#cartNotice");
    const mayo = $("#cartMayo");
    const min = CONFIG.MAYORISTA_MIN_UNIDADES;
    const unidades = totalUnidades();

    notice.hidden = true;
    mayo.hidden = true;

    if (state.modo !== "mayorista" || state.cart.length === 0) return;

    if (unidades < min) {
      mayo.hidden = false;
      mayo.textContent = `Te faltan ${min - unidades} unidad${min - unidades === 1 ? "" : "es"} para llegar al mínimo mayorista (${min}).`;
    } else {
      mayo.hidden = false;
      mayo.textContent = `Estás comprando al precio mayorista. ✓`;
    }
  }

  function setupCarrito() {
    on($("#cartBtn"), "click", () => {
      mostrarVistaCarrito();
      abrirDialogo($("#cartDialog"));
    });
    on($("#cartGoCatalog"), "click", () => {
      cerrarDialogo($("#cartDialog"));
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    });
    on($("#cartKeep"), "click", () => cerrarDialogo($("#cartDialog")));

    on($("#cartCheckout"), "click", () => {
      const min = CONFIG.MAYORISTA_MIN_UNIDADES;
      if (state.modo === "mayorista" && totalUnidades() < min) {
        const notice = $("#cartNotice");
        notice.hidden = false;
        notice.textContent = `Necesitás sumar ${min - totalUnidades()} unidad${min - totalUnidades() === 1 ? "" : "es"} más para completar tu compra mayorista, o cambiá a modo minorista.`;
        return;
      }
      mostrarVistaCheckout();
    });

    on($("#cartBack"), "click", () => mostrarVistaCarrito());
    on($("#sentBack"), "click", () => mostrarVistaCarrito());
    on($("#sentClear"), "click", () => {
      state.cart = [];
      guardarCarrito();
      actualizarCarritoUI();
      showToast("Carrito vacío");
      mostrarVistaCarrito();
    });
  }

  function mostrarVistaCarrito() {
    $("#viewCart").hidden = false;
    $("#checkoutForm").hidden = true;
    $("#viewSent").hidden = true;
    $("#cartBack").hidden = true;
    $("#cartTitle").textContent = "Tu carrito";
    actualizarCarritoUI();
  }

  function mostrarVistaCheckout() {
    injectPaymentOptions();
    $("#viewCart").hidden = true;
    $("#checkoutForm").hidden = false;
    $("#viewSent").hidden = true;
    $("#cartBack").hidden = false;
    $("#cartTitle").textContent = "Tus datos";

    const list = $("#summaryList");
    list.innerHTML = "";
    state.cart.forEach((item) => {
      const li = document.createElement("li");
      const detalle = [item.colorNombre, item.talle ? `Talle ${item.talle}` : null]
        .filter(Boolean)
        .join(" · ");
      li.textContent = `${item.cantidad}x ${item.nombre}${detalle ? " (" + detalle + ")" : ""} — ${formatPrice(precioUnitarioItem(item, state.modo) * item.cantidad)}`;
      list.appendChild(li);
    });
    $("#checkoutTotal").textContent = formatPrice(totalConPromo());
    $("#envioHint").textContent = promoActiva() ? "🎁 En tu primera compra el envío es GRATIS en Córdoba Capital." : "Coordinamos el envío por WhatsApp.";
    const checkoutPromo = $("#checkoutPromo");
    if (checkoutPromo) checkoutPromo.textContent = promoActiva() ? `🎉 Tenés ${CONFIG.PRIMERA_COMPRA.DESCUENTO_PCT}% OFF + envío gratis en tu primera compra.` : "";
  }

  /* ---------- Formulario de checkout ---------- */
  function setError(campo, mensaje) {
    const field = $(`[data-field="${campo}"]`);
    const err = $(`#f${campo.charAt(0).toUpperCase()}${campo.slice(1)}Err`);
    if (field) field.classList.toggle("has-error", Boolean(mensaje));
    if (err) {
      err.textContent = mensaje || "";
      err.hidden = !mensaje;
    }
    return !mensaje;
  }

  function validarCheckout() {
    let ok = true;
    const nombre = $("#fNombre").value.trim();
    const telefono = digitsOnly($("#fTelefono").value);
    const entregaInput = $('input[name="entrega"]:checked');
    const entrega = entregaInput ? entregaInput.value : "";

    ok = setError("nombre", nombre.length < 3 ? "Ingresá tu nombre y apellido." : "") && ok;
    ok = setError("telefono", telefono.length < 8 ? "Ingresá un teléfono válido, con código de área." : "") && ok;
    ok = setError("entrega", !entrega ? "Elegí retiro o envío." : "") && ok;

    if (entrega === "envio") {
      const direccion = $("#fDireccion").value.trim();
      const localidad = $("#fLocalidad").value.trim();
      ok = setError("direccion", direccion.length < 3 ? "Ingresá tu dirección." : "") && ok;
      ok = setError("localidad", localidad.length < 2 ? "Ingresá tu localidad." : "") && ok;
    } else {
      setError("direccion", "");
      setError("localidad", "");
    }

    return ok;
  }

  function setupCheckoutForm() {
    const form = $("#checkoutForm");
    if (!form) return;

    $$('input[name="entrega"]').forEach((radio) => {
      on(radio, "change", () => {
        $("#envioFields").hidden = radio.value !== "envio";
      });
    });

    on(form, "submit", (e) => {
      e.preventDefault();
      const alert = $("#formAlert");

      if (!validarCheckout()) {
        alert.hidden = false;
        alert.textContent = "Revisá los datos marcados antes de continuar.";
        alert.focus();
        return;
      }
      alert.hidden = true;

      const entregaInput = $('input[name="entrega"]:checked');
      const cliente = {
        nombre: $("#fNombre").value.trim(),
        telefono: $("#fTelefono").value.trim(),
        entrega: entregaInput.value,
        direccion: $("#fDireccion").value.trim(),
        localidad: $("#fLocalidad").value.trim(),
        observaciones: $("#fObs").value.trim(),
        pago: ($("#fPago") && $("#fPago").value) || "A coordinar",
      };

      const texto = mensajePedido(state.cart, cliente);
      try { localStorage.setItem(PROMO_KEY, "1"); } catch (err) {}
      const link = buildWaLink(texto);
      $("#sentLink").href = link;

      const ventana = window.open(link, "_blank", "noopener");
      const warn = $("#sentWarn");
      if (!ventana) {
        warn.hidden = false;
        warn.textContent = "El navegador bloqueó la ventana. Tocá el botón para abrir WhatsApp.";
      } else {
        warn.hidden = true;
      }

      $("#viewCart").hidden = true;
      $("#checkoutForm").hidden = true;
      $("#viewSent").hidden = false;
      $("#cartBack").hidden = true;
      $("#cartTitle").textContent = "Pedido enviado";
      $("#sentTitle").focus();
    });
  }

  /* ---------- Lightbox con zoom ---------- */
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
    on(stage, "pointerup", () => {
      arrastrando = false;
    });
    on(stage, "pointercancel", () => {
      arrastrando = false;
    });
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
    const announce = $(".announce");
    if (!announce || !CONFIG.PRIMERA_COMPRA?.ACTIVO) return;
    const items = PRODUCTS.slice(0, 4);
    const promo = document.createElement("section");
    promo.className = "promo-strip";
    promo.innerHTML = `<div class="promo-strip__inner"><div class="promo-strip__copy"><span class="promo-kicker">OFERTA DE BIENVENIDA</span><h2>15% OFF + envío GRATIS</h2><p>En tu primera compra en Córdoba Capital.</p><a class="btn btn--primary" href="#catalogo">Aprovechar promoción <svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></a></div><div class="promo-strip__products">${items.map((p,i)=>`<button class="promo-product" type="button" data-promo-product="${p.id}"><img src="${p.imagenes[0]}" alt="${p.nombre}" loading="lazy"><span>${p.nombre}</span><b>15% OFF</b></button>`).join("")}</div></div>`;
    announce.after(promo);
    promo.querySelectorAll("[data-promo-product]").forEach(btn => on(btn,"click",()=>openProductModal(btn.dataset.promoProduct)));
  }

  function setupEstrella() {
    const cfg = CONFIG.PRODUCTO_ESTRELLA;
    const section = $("#estrella");
    if (!cfg || !cfg.ACTIVO || !section) return;

    const product = PRODUCTS.find((p) => p.id === cfg.PRODUCTO_ID);
    if (!product) return;

    const old = precioProducto(product);
    const promo = Math.round(old * (1 - cfg.DESCUENTO_PCT / 100));

    $$('[data-star="old"]').forEach((el) => (el.textContent = formatPrice(old)));
    $$('[data-star="promo"]').forEach((el) => (el.textContent = formatPrice(promo)));
    $$('[data-star="pct"]').forEach((el) => (el.textContent = String(cfg.DESCUENTO_PCT)));

    $$("[data-star-open]").forEach((btn) => on(btn, "click", () => openProductModal(product.id)));

    section.hidden = false;
  }

  /* ---------- Inicio ---------- */
  function init() {
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
