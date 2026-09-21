(function () {
  "use strict";

  const CFG = window.STORE_CONFIG;
  const CART_KEY = "novatech_cart_v1";

  const state = {
    currency: "ARS",
    products: [],
    categories: [],
    activeCategory: "all",
    cart: loadCart(),
  };

  const fmt = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: state.currency,
    maximumFractionDigits: 0,
  });

  // ---------- persistencia ----------
  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    } catch (e) {
      /* almacenamiento no disponible: el carrito sigue funcionando en memoria */
    }
  }

  // ---------- datos ----------
  async function loadProducts() {
    const res = await fetch(CFG.productsUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error("No se pudo cargar el catálogo");
    const data = await res.json();
    state.products = data.products || [];
    state.categories = data.categories || [];
    state.currency = data.currency || "ARS";
  }

  function findProduct(id) {
    return state.products.find((p) => p.id === id);
  }

  // ---------- render: header / navegación ----------
  function renderNav() {
    const navEl = document.getElementById("navCategories");
    const filterEl = document.getElementById("filterBar");
    const items = [{ id: "all", label: "Todos" }, ...state.categories];

    navEl.innerHTML = items
      .map(
        (c) =>
          `<li><button data-cat="${c.id}" class="${c.id === state.activeCategory ? "active" : ""}">${c.label}</button></li>`
      )
      .join("");

    filterEl.innerHTML = items
      .map(
        (c) =>
          `<button data-cat="${c.id}" class="${c.id === state.activeCategory ? "active" : ""}">${c.label}</button>`
      )
      .join("");

    [navEl, filterEl].forEach((el) => {
      el.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-cat]");
        if (!btn) return;
        state.activeCategory = btn.dataset.cat;
        renderNav();
        renderCatalog();
      });
    });
  }

  // ---------- render: catálogo ----------
  function renderCatalog() {
    const grid = document.getElementById("productGrid");
    const title = document.getElementById("catalogTitle");
    const count = document.getElementById("catalogCount");

    const list =
      state.activeCategory === "all"
        ? state.products
        : state.products.filter((p) => p.category === state.activeCategory);

    const catLabel =
      state.activeCategory === "all"
        ? "Todos los productos"
        : (state.categories.find((c) => c.id === state.activeCategory) || {}).label || "";

    title.textContent = catLabel;
    count.textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;

    grid.innerHTML = list
      .map((p) => {
        const icon = window.ICONS[p.icon] || window.ICONS.hub;
        const outOfStock = p.stock <= 0;
        return `
        <article class="product-card">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
          <div class="product-icon">${icon}</div>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description || ""}</p>
          <div class="product-price">${fmt.format(p.price)}</div>
          <div class="product-stock">${outOfStock ? "Sin stock" : `${p.stock} disponibles`}</div>
          <button class="add-to-cart" data-id="${p.id}" ${outOfStock ? "disabled" : ""}>
            ${outOfStock ? "Sin stock" : "Agregar al carrito"}
          </button>
        </article>`;
      })
      .join("");

    grid.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.dataset.id));
    });
  }

  // ---------- carrito ----------
  function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;
    const current = state.cart[id] || 0;
    if (current + 1 > product.stock) return;
    state.cart[id] = current + 1;
    saveCart();
    renderCart();
    openCart();
  }

  function changeQty(id, delta) {
    const product = findProduct(id);
    if (!product) return;
    const next = (state.cart[id] || 0) + delta;
    if (next <= 0) {
      delete state.cart[id];
    } else if (next <= product.stock) {
      state.cart[id] = next;
    }
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    delete state.cart[id];
    saveCart();
    renderCart();
  }

  function cartEntries() {
    return Object.entries(state.cart)
      .map(([id, qty]) => ({ product: findProduct(id), qty }))
      .filter((e) => e.product);
  }

  function cartTotal() {
    return cartEntries().reduce((sum, e) => sum + e.product.price * e.qty, 0);
  }

  function cartCount() {
    return Object.values(state.cart).reduce((a, b) => a + b, 0);
  }

  function renderCart() {
    const itemsEl = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    const countEl = document.getElementById("cartCount");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const entries = cartEntries();

    countEl.textContent = String(cartCount());
    countEl.hidden = cartCount() === 0;

    if (entries.length === 0) {
      itemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío.</div>';
      checkoutBtn.disabled = true;
    } else {
      itemsEl.innerHTML = entries
        .map(({ product, qty }) => {
          const icon = window.ICONS[product.icon] || window.ICONS.hub;
          return `
          <div class="cart-item">
            <div class="cart-item-icon">${icon}</div>
            <div>
              <p class="cart-item-name">${product.name}</p>
              <span class="cart-item-price">${fmt.format(product.price)}</span>
              <div class="qty-control">
                <button data-action="dec" data-id="${product.id}">${window.ICONS.minus}</button>
                <span>${qty}</span>
                <button data-action="inc" data-id="${product.id}">${window.ICONS.plus}</button>
              </div>
            </div>
            <button class="cart-item-remove" data-action="remove" data-id="${product.id}">${window.ICONS.trash}</button>
          </div>`;
        })
        .join("");
      checkoutBtn.disabled = false;
    }

    totalEl.textContent = fmt.format(cartTotal());

    itemsEl.querySelectorAll("button[data-action]").forEach((btn) => {
      const id = btn.dataset.id;
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "inc") changeQty(id, 1);
        if (btn.dataset.action === "dec") changeQty(id, -1);
        if (btn.dataset.action === "remove") removeFromCart(id);
      });
    });
  }

  // ---------- drawer ----------
  function openCart() {
    document.getElementById("overlay").classList.add("open");
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("cartDrawer").setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    document.getElementById("overlay").classList.remove("open");
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("cartDrawer").setAttribute("aria-hidden", "true");
  }

  // ---------- checkout ----------
  async function checkout() {
    const btn = document.getElementById("checkoutBtn");
    const errorEl = document.getElementById("checkoutError");
    errorEl.classList.remove("show");
    btn.disabled = true;
    btn.textContent = "Procesando...";

    const items = cartEntries().map(({ product, qty }) => ({ id: product.id, quantity: qty }));

    try {
      const res = await fetch(CFG.createPreferenceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        throw new Error(data.error || "No se pudo iniciar el pago.");
      }
      window.location.href = data.init_point;
    } catch (err) {
      errorEl.textContent = err.message || "Ocurrió un error al iniciar el pago. Intentá nuevamente.";
      errorEl.classList.add("show");
      btn.disabled = false;
      btn.textContent = "Pagar con Mercado Pago";
    }
  }

  // ---------- init ----------
  async function init() {
    document.getElementById("logo").textContent = CFG.storeName;
    document.getElementById("heroTitle").textContent = CFG.tagline;
    document.title = `${CFG.storeName} — ${CFG.tagline}`;
    document.getElementById("cartIconWrap").innerHTML = window.ICONS.cart;
    document.getElementById("closeCart").innerHTML = window.ICONS.close;
    document.getElementById("year").textContent = new Date().getFullYear();

    document.getElementById("openCart").addEventListener("click", openCart);
    document.getElementById("closeCart").addEventListener("click", closeCart);
    document.getElementById("overlay").addEventListener("click", closeCart);
    document.getElementById("checkoutBtn").addEventListener("click", checkout);

    try {
      await loadProducts();
    } catch (e) {
      document.getElementById("productGrid").innerHTML =
        '<p style="padding:40px 0;color:#737373;">No se pudo cargar el catálogo. Probá recargando la página.</p>';
      return;
    }

    renderNav();
    renderCatalog();
    renderCart();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
