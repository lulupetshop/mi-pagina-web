/* ==========================================================================
   Lulú Lulú — Catálogo de productos
   Por ahora hay un solo producto real cargado (Sueño Rubí, línea "Moisés
   Rectangular"). El resto de las líneas ya están dadas de alta como
   categorías en la home (con fondo gris, "Próximamente") pero todavía no
   tienen fotos ni precios: sumalas acá a medida que estén listas.

   - categoria: tiene que ser exactamente uno de estos 9 nombres para que
     los filtros y las colecciones de la home sigan funcionando sin tocar
     el HTML: "Moisés Rectangular", "Moisés Redondo", "Nido Cuadrado",
     "Nido Rectangular", "Nido Redondo", "Antiestrés", "Almohadones",
     "Colchón Desmontable Redondo", "Colchoneta Desmontable".
   - imagenes: rutas dentro de assets/img/productos/.
   - colores: opcional. Cada uno es { nombre, hex }. Si el fabricante
     pide "consultar colores disponibles" (como en el catálogo de
     Descanso Peludo), mejor dejarlo vacío: así se muestra el aviso
     de que el color se confirma por WhatsApp, en vez de un color fijo.
   - telas: opcional, para modelos que además del color eligen tela.
   - tamanos: al menos uno. { nombre, medida, recomendado, minorista,
     mayorista }. Precios por unidad, en pesos, sin puntos.
   - Regla de precio mayorista: minorista menos $15.000 por unidad. Se
     aplica parejo a todos los productos y talles.
   - codigoFabricante: opcional, el artículo del catálogo del fabricante
     (para pedir reposición). No se muestra en el sitio.
   ========================================================================== */
const PRODUCTS = [
  {
    id: "moises-rubi",
    categoria: "Moisés Rectangular",
    nombre: "Sueño Rubí",
    descripcion:
      "Bordes altos en pana bordó que contienen, con almohadón central acolchado en tono terracota. Confeccionado en pana o loneta, tela resistente al uso diario.",
    imagenes: ["assets/img/productos/moises-rubi-frente.jpg"],
    colores: [],
    codigoFabricante: "ART.4 (Descanso Peludo, catálogo 2026)",
    tamanos: [
      {
        nombre: "Único",
        medida: "75 x 60 x 18 cm",
        recomendado: "Perros medianos/grandes y gatos",
        minorista: 65000,
        mayorista: 50000,
      },
    ],
  },
  {
    id: "colchon-redondo-desmontable",
    categoria: "Colchón Desmontable Redondo",
    nombre: "Sueño Nube",
    descripcion:
      "Superficie redonda y mullida con funda desmontable para facilitar el lavado. Una opción cómoda y práctica para el descanso diario.",
    imagenes: [
      "assets/img/productos/colchon-redondo-desmontable-gris-claro.jpg",
      "assets/img/productos/colchon-redondo-desmontable-mostaza.jpg",
      "assets/img/productos/colchon-redondo-desmontable-gris-oscuro.jpg",
    ],
    // Orden pedido: gris claro primero, después el resto de los colores.
    colores: [
      { nombre: "Gris Claro", hex: "#8c8885" },
      { nombre: "Mostaza", hex: "#91653a" },
      { nombre: "Gris Oscuro", hex: "#4a4846" },
    ],
    tamanos: [
      {
        nombre: "Único",
        // TODO: falta confirmar el diámetro exacto con el fabricante.
        medida: "A confirmar por WhatsApp",
        recomendado: "Perros y gatos",
        minorista: 70000,
        mayorista: 55000,
      },
    ],
  },
  {
    id: "colchoneta-desmontable",
    categoria: "Colchoneta Desmontable",
    nombre: "Sueño Zen",
    descripcion:
      "Colchoneta rectangular mullida con funda desmontable, pensada para el descanso diario. Fácil de lavar y cómoda para perros y gatos.",
    imagenes: [
      "assets/img/productos/colchoneta-desmontable-azul.jpg",
      "assets/img/productos/colchoneta-desmontable-mostaza.jpg",
      "assets/img/productos/colchoneta-desmontable-gris-oscuro.jpg",
    ],
    colores: [
      { nombre: "Azul", hex: "#303945" },
      { nombre: "Mostaza", hex: "#91653a" },
      { nombre: "Gris Oscuro", hex: "#4a4846" },
    ],
    tamanos: [
      {
        nombre: "Único",
        medida: "87 x 70 x 10 cm",
        recomendado: "Perros medianos/grandes",
        minorista: 75000,
        mayorista: 60000,
      },
    ],
  },
  {
    id: "moises-redondo",
    categoria: "Moisés Redondo",
    nombre: "Sueño Abrazo",
    descripcion:
      "Forma envolvente y almohadón mullido para que tu mascota tenga un rincón cómodo y protegido. Tela resistente al uso diario.",
    imagenes: [
      "assets/img/productos/moises-redondo-azul.jpg",
      "assets/img/productos/moises-redondo-estampado.jpg",
    ],
    colores: [
      { nombre: "Azul", hex: "#394553" },
      { nombre: "Rojo Estampado", hex: "#873b45" },
    ],
    tamanos: [
      {
        nombre: "Único",
        medida: "75 x 60 x 20 cm",
        recomendado: "Perros medianos/grandes y gatos",
        minorista: 65000,
        mayorista: 50000,
      },
    ],
  },
  {
    id: "nido-onix",
    categoria: "Nido Redondo",
    nombre: "Sueño Ónix",
    descripcion:
      "Nido redondo bien mullido, con borde alto que envuelve y abraza. Confeccionado en pana sobre fricelina, cálido y resistente al uso diario.",
    imagenes: ["assets/img/productos/nido-onix-gris.jpg"],
    colores: [],
    tamanos: [
      {
        nombre: "Único",
        medida: "45 x 10 cm",
        recomendado: "Perros pequeños y gatos",
        minorista: 45000,
        mayorista: 30000,
      },
    ],
  },
];

/* Hero rotativo: usa directamente los nombres del catálogo para evitar una
   segunda lista de productos que pueda quedar desactualizada. */
(function () {
  function setupHeroCopy() {
    const hero = document.querySelector(".hero__copy");
    if (!hero || !Array.isArray(PRODUCTS) || !PRODUCTS.length) return;

    const lead = hero.querySelector(".lead");
    const cta = hero.querySelector(".hero__cta");
    if (!lead || !cta) return;

    if (!document.getElementById("luluHeroRotatorStyles")) {
      const style = document.createElement("style");
      style.id = "luluHeroRotatorStyles";
      style.textContent = `
        .hero__rotator-label{display:block;margin-bottom:.15em;font-size:.9em;opacity:.82}
        .hero__rotator{display:block;height:1.45em;overflow:hidden;position:relative;font-family:var(--font-display);font-weight:700}
        .hero__rotator-words{display:block;animation:luluHeroWords 12s cubic-bezier(.22,1,.36,1) infinite;will-change:transform}
        .hero__rotator-words span{display:block;height:1.45em;color:var(--terracotta-300);font-weight:800}
        @keyframes luluHeroWords{
          0%,14%{transform:translateY(0)}
          18%,34%{transform:translateY(-20%)}
          38%,54%{transform:translateY(-40%)}
          58%,74%{transform:translateY(-60%)}
          78%,94%{transform:translateY(-80%)}
          100%{transform:translateY(0)}
        }
        @media (max-width:600px){.hero__rotator{font-size:.96em}.hero__rotator-label{font-size:.82em}}
        @media (prefers-reduced-motion:reduce){.hero__rotator-words{animation:none}.hero__rotator-words span:not(:first-child){display:none}}
      `;
      document.head.appendChild(style);
    }

    const words = lead.querySelector(".hero__rotator-words");
    const models = PRODUCTS.map((product) => product.nombre).filter(Boolean);
    words.innerHTML = models.map((name) => `<span>${name}</span>`).join("");

    const waButton = cta.querySelector('[data-wa="consulta"]');
    if (waButton) waButton.remove();

    const catalogButton = cta.querySelector('a[href="#catalogo"]');
    if (catalogButton) {
      const textNode = Array.from(catalogButton.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = "Ver camas ";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroCopy, { once: true });
  } else {
    setupHeroCopy();
  }
})();
