/* ==========================================================================
   Lulú Lulú — Catálogo de productos
   Por ahora hay un solo producto real cargado (Moisés Rubí, línea "Moisés
   Cuadrado"). El resto de las líneas ya están dadas de alta como
   categorías en la home (con fondo gris, "Próximamente") pero todavía no
   tienen fotos ni precios: sumalas acá a medida que estén listas.

   - categoria: tiene que ser exactamente uno de estos 9 nombres para que
     los filtros y las colecciones de la home sigan funcionando sin tocar
     el HTML: "Moisés Cuadrado", "Moisés Redondo", "Nido Cuadrado",
     "Nido Rectangular", "Nido Redondo", "Antiestrés", "Almohadones",
     "Colchón Desmontable Redondo", "Colchoneta Desmontable".
   - imagenes: rutas dentro de assets/img/productos/.
   - colores: opcional. Cada uno es { nombre, hex }.
   - telas: opcional, para modelos que además del color eligen tela.
   - tamanos: al menos uno. { nombre, medida, recomendado, minorista,
     mayorista }. Precios por unidad, en pesos, sin puntos.
   ========================================================================== */
const PRODUCTS = [
  {
    id: "moises-rubi",
    categoria: "Moisés Cuadrado",
    nombre: "Moisés Rubí",
    descripcion:
      "Bordes altos en pana bordó que contienen, con almohadón central acolchado en tono terracota. Tela resistente al uso diario.",
    imagenes: ["assets/img/productos/moises-rubi-frente.jpg"],
    colores: [{ nombre: "Bordó", hex: "#612127" }],
    tamanos: [
      {
        nombre: "Único",
        medida: "75 x 60 x 18 cm",
        recomendado: "Perros medianos/grandes y gatos",
        // TODO: el precio mayorista todavía no está definido por separado.
        // Se usa el mismo valor que el minorista hasta que se confirme el
        // precio por mayor de este modelo.
        minorista: 54000,
        mayorista: 54000,
      },
    ],
  },
];
