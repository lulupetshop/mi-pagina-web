/* ==========================================================================
   Lulú Lulú — Catálogo de productos
   Datos de ejemplo (fotos, colores y precios) para que el sitio se vea
   completo. Reemplazalos por los productos reales:
   - categoria: tiene que ser una de "Moisés", "Nidos", "Colchonetas" o
     "Almohadones" para que los filtros y las colecciones de la home
     funcionen sin tocar el HTML.
   - imagenes: rutas dentro de assets/img/productos/ (subí las fotos ahí).
   - colores: opcional. Cada uno es { nombre, hex } y se muestra como
     pastilla de color en el detalle del producto.
   - telas: opcional. Si un producto viene en distintas telas además del
     color, agregá un array de strings, ej. ["Pana", "Loneta antidesgarro"].
   - tamanos: al menos uno. { nombre, medida, recomendado, minorista,
     mayorista }. Los precios son por unidad, en pesos, sin puntos.
   ========================================================================== */
const PRODUCTS = [
  // ===== MOISÉS =====
  {
    id: "moises-rubi",
    categoria: "Moisés",
    nombre: "Moisés Rubí",
    descripcion:
      "Bordes altos que contienen, almohadón central acolchado y una tela que aguanta el uso diario. Nuestro modelo más elegido.",
    imagenes: [
      "assets/img/productos/moises-rubi-1.webp",
      "assets/img/productos/moises-rubi-2.webp",
      "assets/img/productos/moises-rubi-3.webp",
    ],
    colores: [
      { nombre: "Pana Roja", hex: "#a4373a" },
      { nombre: "Loneta Gris", hex: "#8a8f98" },
    ],
    tamanos: [
      { nombre: "S", medida: "55 x 45 x 15 cm", recomendado: "Gatos y perros pequeños", minorista: 26500, mayorista: 17800 },
      { nombre: "M", medida: "65 x 55 x 16 cm", recomendado: "Perros medianos", minorista: 31800, mayorista: 21200 },
      { nombre: "L", medida: "75 x 60 x 18 cm", recomendado: "Perros grandes", minorista: 37500, mayorista: 25100 },
    ],
  },
  {
    id: "moises-redondo",
    categoria: "Moisés",
    nombre: "Moisés Redondo",
    descripcion:
      "Forma circular envolvente, ideal para mascotas que duermen hechas un ovillo. Relleno mullido que no se apelmaza.",
    imagenes: [
      "assets/img/productos/moises-redondo-1.webp",
      "assets/img/productos/moises-redondo-2.webp",
    ],
    colores: [
      { nombre: "Beige", hex: "#d8c6a8" },
      { nombre: "Gris Topo", hex: "#7c7367" },
      { nombre: "Terracota", hex: "#c1703f" },
    ],
    tamanos: [
      { nombre: "S", medida: "50 x 50 x 16 cm", recomendado: "Gatos y perros pequeños", minorista: 29900, mayorista: 19800 },
      { nombre: "M", medida: "60 x 60 x 18 cm", recomendado: "Perros medianos", minorista: 35250, mayorista: 23500 },
      { nombre: "L", medida: "70 x 70 x 20 cm", recomendado: "Perros grandes", minorista: 41200, mayorista: 27600 },
    ],
  },
  {
    id: "moises-nube",
    categoria: "Moisés",
    nombre: "Moisés Nube",
    descripcion:
      "Relleno extra mullido y bordes bajos, pensado para mascotas que duermen estiradas y quieren asomar la cabeza.",
    imagenes: [
      "assets/img/productos/moises-nube-1.webp",
      "assets/img/productos/moises-nube-2.webp",
    ],
    colores: [
      { nombre: "Celeste", hex: "#a9c6db" },
      { nombre: "Blanco Hueso", hex: "#efe9de" },
    ],
    tamanos: [
      { nombre: "M", medida: "64 x 54 x 14 cm", recomendado: "Perros medianos", minorista: 30500, mayorista: 20400 },
      { nombre: "L", medida: "74 x 58 x 16 cm", recomendado: "Perros grandes", minorista: 36900, mayorista: 24700 },
    ],
  },
  {
    id: "moises-oslo",
    categoria: "Moisés",
    nombre: "Moisés Oslo",
    descripcion:
      "Líneas simples en cuerina símil cuero, fácil de limpiar y con mucha resistencia al uso diario.",
    imagenes: ["assets/img/productos/moises-oslo-1.webp"],
    colores: [
      { nombre: "Marrón Cuero", hex: "#6b4226" },
      { nombre: "Negro", hex: "#2b2b2b" },
    ],
    tamanos: [
      { nombre: "S", medida: "52 x 44 x 14 cm", recomendado: "Gatos y perros pequeños", minorista: 27800, mayorista: 18600 },
      { nombre: "M", medida: "62 x 52 x 16 cm", recomendado: "Perros medianos", minorista: 33100, mayorista: 22100 },
    ],
  },

  // ===== NIDOS =====
  {
    id: "nido-otono",
    categoria: "Nidos",
    nombre: "Nido Otoño",
    descripcion:
      "Paredes altas y mullidas que envuelven a tu mascota por completo, ideal para climas fríos.",
    imagenes: [
      "assets/img/productos/nido-otono-1.webp",
      "assets/img/productos/nido-otono-2.webp",
    ],
    colores: [
      { nombre: "Mostaza", hex: "#c99a3c" },
      { nombre: "Verde Bosque", hex: "#445c44" },
    ],
    tamanos: [
      { nombre: "XS", medida: "40 x 40 x 20 cm", recomendado: "Gatos y perros toy", minorista: 22400, mayorista: 15000 },
      { nombre: "S", medida: "50 x 50 x 22 cm", recomendado: "Perros pequeños", minorista: 26900, mayorista: 18000 },
      { nombre: "M", medida: "60 x 60 x 24 cm", recomendado: "Perros medianos", minorista: 32400, mayorista: 21700 },
    ],
  },
  {
    id: "nido-polar",
    categoria: "Nidos",
    nombre: "Nido Polar",
    descripcion:
      "Interior polar ultra suave y exterior antidesgarro, para el máximo abrigo en las noches más frías.",
    imagenes: ["assets/img/productos/nido-polar-1.webp"],
    colores: [
      { nombre: "Gris Perla", hex: "#c7c9cc" },
      { nombre: "Rosa Viejo", hex: "#c99999" },
    ],
    tamanos: [
      { nombre: "S", medida: "48 x 48 x 20 cm", recomendado: "Perros pequeños", minorista: 25300, mayorista: 16900 },
      { nombre: "M", medida: "58 x 58 x 22 cm", recomendado: "Perros medianos", minorista: 30700, mayorista: 20500 },
      { nombre: "L", medida: "68 x 68 x 24 cm", recomendado: "Perros grandes", minorista: 36400, mayorista: 24300 },
    ],
  },
  {
    id: "nido-safari",
    categoria: "Nidos",
    nombre: "Nido Safari",
    descripcion:
      "Base firme antideslizante y bordes acolchados para un nido que mantiene su forma con el uso diario.",
    imagenes: [
      "assets/img/productos/nido-safari-1.webp",
      "assets/img/productos/nido-safari-2.webp",
    ],
    colores: [
      { nombre: "Arena", hex: "#cdb280" },
      { nombre: "Gris Grafito", hex: "#4c4c52" },
    ],
    tamanos: [
      { nombre: "S", medida: "50 x 50 x 21 cm", recomendado: "Perros pequeños", minorista: 27100, mayorista: 18100 },
      { nombre: "M", medida: "60 x 60 x 23 cm", recomendado: "Perros medianos", minorista: 32800, mayorista: 21900 },
    ],
  },
  {
    id: "nido-luna",
    categoria: "Nidos",
    nombre: "Nido Luna",
    descripcion:
      "Forma ovalada con un lado más bajo, para que tu mascota entre y salga sin esfuerzo.",
    imagenes: ["assets/img/productos/nido-luna-1.webp"],
    colores: [
      { nombre: "Lila", hex: "#9a86b5" },
      { nombre: "Gris Claro", hex: "#d7d7d9" },
    ],
    tamanos: [
      { nombre: "M", medida: "62 x 52 x 20 cm", recomendado: "Perros medianos", minorista: 31200, mayorista: 20800 },
      { nombre: "L", medida: "72 x 60 x 22 cm", recomendado: "Perros grandes", minorista: 36700, mayorista: 24500 },
    ],
  },

  // ===== COLCHONETAS =====
  {
    id: "colchoneta-basica",
    categoria: "Colchonetas",
    nombre: "Colchoneta Básica",
    descripcion:
      "Liviana, plana y fácil de trasladar. Ideal para el auto, la oficina o de paseo.",
    imagenes: ["assets/img/productos/colchoneta-basica-1.webp"],
    colores: [
      { nombre: "Gris", hex: "#9a9aa0" },
      { nombre: "Azul Petróleo", hex: "#355166" },
    ],
    tamanos: [
      { nombre: "S", medida: "55 x 40 cm", recomendado: "Gatos y perros pequeños", minorista: 14900, mayorista: 9800 },
      { nombre: "M", medida: "70 x 50 cm", recomendado: "Perros medianos", minorista: 18400, mayorista: 12300 },
      { nombre: "L", medida: "90 x 60 cm", recomendado: "Perros grandes", minorista: 22900, mayorista: 15300 },
    ],
  },
  {
    id: "colchoneta-viaje",
    categoria: "Colchonetas",
    nombre: "Colchoneta de Viaje",
    descripcion:
      "Se enrolla y se ata con velcro para llevarla a cualquier lado sin ocupar espacio.",
    imagenes: [
      "assets/img/productos/colchoneta-viaje-1.webp",
      "assets/img/productos/colchoneta-viaje-2.webp",
    ],
    colores: [
      { nombre: "Verde Oliva", hex: "#6d7a52" },
      { nombre: "Gris Oscuro", hex: "#54555c" },
    ],
    tamanos: [
      { nombre: "M", medida: "65 x 50 cm", recomendado: "Perros medianos", minorista: 19600, mayorista: 13100 },
      { nombre: "L", medida: "85 x 60 cm", recomendado: "Perros grandes", minorista: 24200, mayorista: 16200 },
    ],
  },
  {
    id: "colchoneta-ortopedica",
    categoria: "Colchonetas",
    nombre: "Colchoneta Ortopédica",
    descripcion:
      "Espuma de alta densidad que acompaña a mascotas mayores o con problemas articulares.",
    imagenes: ["assets/img/productos/colchoneta-ortopedica-1.webp"],
    colores: [{ nombre: "Gris Piedra", hex: "#8c8d84" }],
    tamanos: [
      { nombre: "M", medida: "75 x 55 cm", recomendado: "Perros medianos", minorista: 27800, mayorista: 18600 },
      { nombre: "L", medida: "95 x 65 cm", recomendado: "Perros grandes", minorista: 33500, mayorista: 22400 },
      { nombre: "XL", medida: "110 x 75 cm", recomendado: "Perros muy grandes", minorista: 39900, mayorista: 26700 },
    ],
  },
  {
    id: "colchoneta-doble-faz",
    categoria: "Colchonetas",
    nombre: "Colchoneta Doble Faz",
    descripcion:
      "Un lado polar para el invierno y otro fresco para el verano, en una sola pieza.",
    imagenes: ["assets/img/productos/colchoneta-doble-faz-1.webp"],
    colores: [
      { nombre: "Beige/Gris", hex: "#cdbfa5" },
      { nombre: "Azul/Blanco", hex: "#7fa1c3" },
    ],
    tamanos: [
      { nombre: "S", medida: "55 x 40 cm", recomendado: "Gatos y perros pequeños", minorista: 16800, mayorista: 11200 },
      { nombre: "M", medida: "70 x 50 cm", recomendado: "Perros medianos", minorista: 20900, mayorista: 13900 },
    ],
  },

  // ===== ALMOHADONES =====
  {
    id: "almohadon-polar-soft",
    categoria: "Almohadones",
    nombre: "Almohadón Polar Soft",
    descripcion:
      "Relleno siliconado que no se apelmaza y funda polar extra suave al tacto.",
    imagenes: ["assets/img/productos/almohadon-polar-soft-1.webp"],
    colores: [
      { nombre: "Crema", hex: "#e8dfc8" },
      { nombre: "Gris", hex: "#a9a9ad" },
      { nombre: "Rosa", hex: "#dba8b0" },
    ],
    tamanos: [
      { nombre: "S", medida: "45 x 35 cm", recomendado: "Gatos y perros pequeños", minorista: 11900, mayorista: 7900 },
      { nombre: "M", medida: "60 x 45 cm", recomendado: "Perros medianos", minorista: 14800, mayorista: 9900 },
      { nombre: "L", medida: "75 x 55 cm", recomendado: "Perros grandes", minorista: 18300, mayorista: 12200 },
    ],
  },
  {
    id: "almohadon-redondo",
    categoria: "Almohadones",
    nombre: "Almohadón Redondo",
    descripcion:
      "Forma circular con borde inflado, muy cómodo para dormir hecho un ovillo.",
    imagenes: ["assets/img/productos/almohadon-redondo-1.webp"],
    colores: [
      { nombre: "Mostaza", hex: "#c99a3c" },
      { nombre: "Gris Topo", hex: "#7c7367" },
    ],
    tamanos: [
      { nombre: "S", medida: "45 cm de diámetro", recomendado: "Gatos y perros pequeños", minorista: 12800, mayorista: 8500 },
      { nombre: "M", medida: "60 cm de diámetro", recomendado: "Perros medianos", minorista: 15900, mayorista: 10600 },
    ],
  },
  {
    id: "almohadon-cuerina",
    categoria: "Almohadones",
    nombre: "Almohadón Cuerina",
    descripcion:
      "Base resistente al agua y a las uñas, ideal para el exterior o un patio cubierto.",
    imagenes: ["assets/img/productos/almohadon-cuerina-1.webp"],
    colores: [
      { nombre: "Marrón Cuero", hex: "#6b4226" },
      { nombre: "Negro", hex: "#2b2b2b" },
    ],
    tamanos: [
      { nombre: "M", medida: "60 x 45 cm", recomendado: "Perros medianos", minorista: 16400, mayorista: 10900 },
      { nombre: "L", medida: "75 x 55 cm", recomendado: "Perros grandes", minorista: 19900, mayorista: 13300 },
    ],
  },
  {
    id: "almohadon-viajero",
    categoria: "Almohadones",
    nombre: "Almohadón Viajero",
    descripcion:
      "Liviano y plegable, con manija para llevarlo cómodo a cualquier lado.",
    imagenes: ["assets/img/productos/almohadon-viajero-1.webp"],
    colores: [
      { nombre: "Azul Petróleo", hex: "#355166" },
      { nombre: "Verde Oliva", hex: "#6d7a52" },
    ],
    tamanos: [
      { nombre: "S", medida: "45 x 35 cm", recomendado: "Gatos y perros pequeños", minorista: 12200, mayorista: 8100 },
      { nombre: "M", medida: "58 x 45 cm", recomendado: "Perros medianos", minorista: 15100, mayorista: 10100 },
    ],
  },
];
