/* ==========================================================================
   Lulú Lulú — Catálogo de productos
   Por ahora hay un solo producto real cargado (Moisés Rubí, línea "Moisés
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
     Descanso Peludo), mejor dejarlo vacío: así se muestra el aviso de
     que el color se confirma por WhatsApp, en vez de un color fijo.
   - telas: opcional, para modelos que además del color eligen tela.
   - tamanos: al menos uno. { nombre, medida, recomendado, minorista,
     mayorista }. Precios por unidad, en pesos, sin puntos.
   - codigoFabricante: opcional, el artículo del catálogo del fabricante
     (para pedir reposición). No se muestra en el sitio.
   ========================================================================== */
const PRODUCTS = [
  {
    id: "moises-rubi",
    categoria: "Moisés Rectangular",
    nombre: "Moisés Rubí",
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
        minorista: 64000,
        // Precio de fábrica (Descanso Peludo, catálogo 2026, ART.4 "Moisés
        // Rectangular" 75x60x18cm): $29.500 por unidad.
        mayorista: 29500,
      },
    ],
  },
  {
    id: "colchon-redondo-desmontable",
    categoria: "Colchón Desmontable Redondo",
    nombre: "Colchón Redondo Desmontable",
    descripcion:
      "Colchoneta redonda con funda desmontable y relleno mullido, fácil de lavar. Base antideslizante para que no se mueva en el piso.",
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
        // TODO: precio mayorista todavía no definido; usa el mismo valor
        // que el minorista hasta confirmarlo.
        mayorista: 70000,
      },
    ],
  },
  {
    id: "colchoneta-desmontable",
    categoria: "Colchoneta Desmontable",
    nombre: "Colchoneta Desmontable",
    descripcion:
      "Colchoneta rectangular en tela pana, con funda desmontable y relleno mullido, fácil de lavar. Vivo en las costuras que le da terminación prolija.",
    imagenes: ["assets/img/productos/colchoneta-desmontable-azul.jpg"],
    colores: [],
    tamanos: [
      {
        nombre: "Único",
        medida: "87 x 70 x 10 cm",
        recomendado: "Perros medianos/grandes y gatos",
        minorista: 75000,
        // TODO: precio mayorista todavía no definido; usa el mismo valor
        // que el minorista hasta confirmarlo.
        mayorista: 75000,
      },
    ],
  },
  {
    id: "moises-redondo",
    categoria: "Moisés Redondo",
    nombre: "Moisés Redondo",
    descripcion:
      "Forma circular envolvente con almohadón central mullido. Tela resistente al uso diario.",
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
        // TODO: precio mayorista todavía no definido; usa el mismo valor
        // que el minorista hasta confirmarlo.
        mayorista: 65000,
      },
    ],
  },
];
