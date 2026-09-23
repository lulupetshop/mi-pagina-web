(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  function setFieldError(campo, mensaje) {
    const field = document.querySelector(`[data-field="${campo}"]`);
    const err = document.getElementById(`${campo}Err`) || document.getElementById(`loginEmailErr`);
    if (field) field.classList.toggle("has-error", Boolean(mensaje));
  }

  async function apiGet(url) {
    const res = await fetch(url, { credentials: "same-origin" });
    return res.json().catch(() => null);
  }

  async function apiPost(url, data, method) {
    const res = await fetch(url, {
      method: method || "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
    });
    return res.json().catch(() => null);
  }

  const formatPrice = (n) =>
    "$ " + Math.round(Number(n) || 0).toLocaleString("es-AR");

  const ESTADO_LABEL = {
    aprobado: "Aprobado",
    pendiente: "Pendiente",
    rechazado: "Rechazado",
    cancelado: "Cancelado",
    reembolsado: "Reembolsado",
    contracargo: "Contracargo",
  };

  /* ---------- Login (link mágico) ---------- */
  function setupLogin() {
    const form = $("#loginForm");
    if (!form) return;
    on(form, "submit", async (e) => {
      e.preventDefault();
      const email = $("#loginEmail").value.trim();
      if (!email || !email.includes("@")) {
        setFieldError("email", "Ingresá un email válido.");
        return;
      }
      setFieldError("email", "");
      const btn = $("#loginSubmit");
      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = "Enviando…";
      try {
        await apiPost("api/auth/solicitar-acceso.php", { email });
        form.hidden = true;
        $("#loginSent").hidden = false;
      } catch (err) {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  /* ---------- Pedidos ---------- */
  function renderPedidos(pedidos) {
    const list = $("#ordersList");
    const empty = $("#ordersEmpty");
    list.innerHTML = "";
    if (!pedidos.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    pedidos.forEach((pedido) => {
      const li = document.createElement("li");
      const fecha = new Date(pedido.creado_en.replace(" ", "T"));
      const detalle = (pedido.items || [])
        .map((it) => `${it.cantidad}x ${it.nombre}`)
        .join(", ");
      const info = document.createElement("div");
      info.className = "account-order__info";
      info.innerHTML = `<b>Pedido #${pedido.id} — ${formatPrice(pedido.total)}</b><span>${detalle}</span>`;
      const estado = document.createElement("span");
      estado.className = `account-order__status account-order__status--${pedido.estado}`;
      estado.textContent = ESTADO_LABEL[pedido.estado] || pedido.estado;
      li.append(info, estado);
      list.appendChild(li);
    });
  }

  async function cargarPedidos() {
    const data = await apiGet("api/auth/pedidos.php");
    if (data && data.ok) renderPedidos(data.pedidos || []);
  }

  /* ---------- Mascotas ---------- */
  function renderMascotas(mascotas) {
    const list = $("#petsList");
    const empty = $("#petsEmpty");
    list.innerHTML = "";
    if (!mascotas.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    const TIPO_LABEL = { perro: "Perro", gato: "Gato", otro: "Otro" };
    mascotas.forEach((m) => {
      const li = document.createElement("li");
      const detalle = [TIPO_LABEL[m.tipo] || m.tipo, m.raza, m.tamano]
        .filter(Boolean)
        .join(" · ");
      const info = document.createElement("div");
      info.className = "account-pet__info";
      info.innerHTML = `<b>${m.nombre}</b><span>${detalle}</span>`;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "account-pet__remove";
      removeBtn.setAttribute("aria-label", `Quitar a ${m.nombre}`);
      removeBtn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-trash"/></svg>';
      on(removeBtn, "click", async () => {
        if (!confirm(`¿Quitar a ${m.nombre} de tus mascotas?`)) return;
        await fetch(`api/auth/mascotas.php?id=${m.id}`, { method: "DELETE", credentials: "same-origin" });
        cargarMascotas();
      });
      li.append(info, removeBtn);
      list.appendChild(li);
    });
  }

  async function cargarMascotas() {
    const data = await apiGet("api/auth/mascotas.php");
    if (data && data.ok) renderMascotas(data.mascotas || []);
  }

  function setupMascotas() {
    const toggle = $("#petAddToggle");
    const form = $("#petForm");
    on(toggle, "click", () => {
      form.hidden = !form.hidden;
      toggle.textContent = form.hidden ? "+ Agregar mascota" : "Cancelar";
    });

    on(form, "submit", async (e) => {
      e.preventDefault();
      const alert = $("#petFormAlert");
      alert.hidden = true;

      const payload = {
        nombre: $("#petNombre").value.trim(),
        tipo: $("#petTipo").value,
        raza: $("#petRaza").value.trim(),
        tamano: $("#petTamano").value,
        fecha_nacimiento: $("#petFecha").value,
        notas: $("#petNotas").value.trim(),
      };

      const data = await apiPost("api/auth/mascotas.php", payload);
      if (!data || !data.ok) {
        alert.hidden = false;
        alert.textContent = (data && data.error) || "No se pudo guardar la mascota.";
        return;
      }

      form.reset();
      form.hidden = true;
      toggle.textContent = "+ Agregar mascota";
      cargarMascotas();
    });
  }

  /* ---------- Estado de sesión ---------- */
  async function init() {
    const params = new URLSearchParams(location.search);
    const accion = params.get("accion");
    if (params.get("acceso") === "invalido") {
      const sent = $("#loginSent");
      sent.hidden = false;
      sent.className = "notice notice--warn";
      sent.textContent = "Ese link ya venció o no es válido. Pedí uno nuevo con tu email.";
    }
    params.delete("acceso");
    params.delete("accion");
    const query = params.toString();
    history.replaceState({}, "", location.pathname + (query ? `?${query}` : ""));

    setupLogin();
    setupMascotas();
    on($("#logoutBtn"), "click", async () => {
      await apiPost("api/auth/cerrar-sesion.php", {});
      location.reload();
    });

    const data = await apiGet("api/auth/estado-sesion.php");
    if (data && data.ok && data.logueado) {
      $("#accountLoggedIn").hidden = false;
      $("#accountEmail").textContent = data.usuario.email;
      cargarPedidos();
      cargarMascotas();
      if (accion === "agregar-mascota") {
        $("#petAddToggle").click();
        $("#petForm").scrollIntoView({ behavior: "smooth", block: "center" });
        $("#petNombre").focus();
      }
    } else {
      $("#accountLoggedOut").hidden = false;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
