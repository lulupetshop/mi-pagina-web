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
/* Hero: los nombres salen del catálogo para mantenerlos siempre sincronizados. */
(function () {
  function setupHeroCopy() {
    const words = document.querySelector(".hero__rotator-words");
    if (!words || !Array.isArray(PRODUCTS)) return;

    const models = PRODUCTS
      .map((product) => product.nombre.replace(/^Sueño\s+/i, "").trim())
      .filter(Boolean);
    if (!models.length) return;

    words.innerHTML = models.map((name) => {
      const span = document.createElement("span");
      span.textContent = name;
      return span.outerHTML;
    }).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroCopy, { once: true });
  } else {
    setupHeroCopy();
  }
})();
