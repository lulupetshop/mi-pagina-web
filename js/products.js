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
        minorista: 54000,
        // Precio de fábrica (Descanso Peludo, catálogo 2026, ART.4 "Moisés
        // Rectangular" 75x60x18cm): $29.500 por unidad.
        mayorista: 29500,
      },
    ],
  },
];
