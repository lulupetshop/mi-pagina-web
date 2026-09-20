# Lulú Lulú — Tienda de camas para mascotas

Sitio estático (HTML + CSS + JavaScript, sin build ni dependencias). Catálogo, carrito y pedido por WhatsApp, con precios minorista y mayorista.

## Estructura
- `index.html` — página principal
- `css/styles.css` — estilos
- `js/config.js` — número de WhatsApp, mínimo mayorista, promo del producto estrella
- `js/products.js` — catálogo de productos y precios
- `js/app.js` — lógica (catálogo, carrito, pedido)
- `assets/` — imágenes, logo y video
- `.htaccess` — caché para Hostinger/Apache

## Cómo editar
- Número de WhatsApp y textos: `js/config.js`
- Productos, precios y fotos: `js/products.js`
- Después de cambiar CSS/JS, subí la fecha en `?v=` dentro de `index.html`.

## Publicar
Subí todo el contenido de esta carpeta a la raíz del hosting (Hostinger) o activá GitHub Pages sobre la rama `main`.