# NOVA Tech — Tienda de productos tecnológicos

Sitio independiente de "Lulú Lulú" (vive en esta carpeta `tienda-tecnologia/`).
Diseño moderno y minimalista en blanco y negro. Catálogo, carrito y pago real
con **Mercado Pago (Checkout Pro)**.

No usa frameworks ni build: HTML + CSS + JS en el navegador, y **PHP** en el
servidor (Hostinger lo soporta) solo para lo que *tiene* que ser seguro:
crear la preferencia de pago con tu Access Token, que nunca debe estar en el
navegador.

## Estructura

```
tienda-tecnologia/
├── index.html              página principal (catálogo + carrito)
├── pago-exitoso.html        página de retorno: pago aprobado
├── pago-pendiente.html      página de retorno: pago pendiente
├── pago-fallido.html        página de retorno: pago rechazado/cancelado
├── css/styles.css           estilos (paleta blanco/negro)
├── js/config.js             nombre de la tienda, textos
├── js/icons.js              íconos SVG de productos
├── js/app.js                catálogo, carrito, checkout
├── data/products.json       catálogo de productos y precios (fuente única)
└── api/
    ├── config.example.php   plantilla de credenciales (sí se sube al repo)
    ├── config.php           tus credenciales reales (NO se sube, está en .gitignore)
    ├── create_preference.php  crea la preferencia de pago en Mercado Pago
    └── webhook.php           recibe notificaciones de pago y las guarda en orders.log
```

## 1. Editar el catálogo

Todo el catálogo (nombres, precios, stock, categorías) vive en
`data/products.json`. Es la única fuente de verdad: el precio que se cobra
en Mercado Pago siempre se recalcula desde ahí en el servidor, así nadie
puede alterar un precio editando el JavaScript del navegador.

Los productos actuales son de ejemplo. Para agregar uno nuevo, copiá un
bloque y cambiá los datos:

```json
{
  "id": "acc-04",
  "name": "Cargador GaN 65W",
  "category": "accesorios",
  "price": 38000,
  "stock": 20,
  "icon": "hub",
  "description": "Carga rápida para notebook y celular en un solo cargador.",
  "badge": "Nuevo"
}
```

Íconos disponibles (`icon`): `laptop`, `phone`, `headphones`, `speaker`,
`watch`, `mouse`, `keyboard`, `hub`. Si más adelante querés fotos reales en
vez de íconos, decímelo y adapto el catálogo y las tarjetas de producto.

## 2. Obtener tus credenciales de Mercado Pago

1. Entrá a [mercadopago.com.ar/developers/panel](https://www.mercadopago.com.ar/developers/panel/app) con tu cuenta de Mercado Pago (si no tenés, te la creás gratis en mercadopago.com.ar).
2. Creá una aplicación: elegí **"Pagos online"** → modelo **"Checkout Pro"**.
3. Dentro de la aplicación, andá a **"Credenciales de prueba"** y copiá el
   **Access Token** (empieza con `TEST-...`). Usalo primero para probar todo
   sin cobrar de verdad.
4. Cuando el sitio esté publicado con tu dominio real, andá a
   **"Credenciales de producción"** y copiá ese Access Token (empieza con
   `APP_USR-...`). Con ese ya se cobra en serio.

## 3. Configurar el servidor

1. Copiá `api/config.example.php` a `api/config.php` (mismo directorio).
2. Completá:
   - `mp_access_token`: el Access Token del paso anterior (prueba o producción).
   - `site_url`: la URL pública donde vas a publicar esta carpeta, sin barra
     final. Ejemplo: `https://tudominio.com/tienda-tecnologia` o
     `https://tudominio.com` si la subís a la raíz del hosting.
3. **Nunca subas `api/config.php` a GitHub** (ya está en `.gitignore` para
   evitarlo).

## 4. Publicar en Hostinger

1. Subí **todo el contenido** de esta carpeta (`tienda-tecnologia/`) por
   FTP o el Administrador de archivos de Hostinger, a la raíz del dominio o
   a una subcarpeta (ej. `tudominio.com/tienda-tecnologia`).
2. Asegurate de subir también `api/config.php` (no viene en GitHub por
   seguridad: se sube manualmente solo al hosting).
3. Verificá que el hosting tenga PHP activado (Hostinger lo trae por
   defecto) y que `.htaccess` haya subido correctamente (es un archivo
   oculto).
4. Probá primero con el Access Token de **prueba**: hacé una compra con
   [tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards).
5. Cuando todo funcione, reemplazá el Access Token en `api/config.php` por
   el de **producción**.

> Nota: GitHub Pages **no sirve** para esta tienda porque no ejecuta PHP.
> Necesitás un hosting con PHP como Hostinger.

## 5. Ver los pagos recibidos

Cada notificación de pago que envía Mercado Pago se guarda como una línea
en `api/orders.log` (fecha, estado, monto, email del comprador). No hay
base de datos ni panel de administración: es un registro simple para
consultar manualmente. Si más adelante querés un panel de pedidos o enviar
un email automático por cada venta, decímelo y lo sumamos sobre esta base.

## Personalizar textos y nombre

- Nombre de la tienda y frase principal: `js/config.js`.
- Categorías: se generan automáticamente desde `data/products.json`.
- Después de cambiar `css/styles.css` o `js/app.js`, actualizá el `?v=` en
  `index.html` para que los navegadores bajen la versión nueva.
