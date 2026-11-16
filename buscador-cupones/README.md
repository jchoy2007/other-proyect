# Buscador de cupones

Le pasas el enlace de un producto de **Amazon, Newegg, Best Buy, Walmart o eBay** y busca automáticamente:

| Tipo | Qué es | De dónde sale |
|---|---|---|
| Códigos promocionales | Se escriben al pagar | Slickdeals, Reddit, CouponFollow, la propia página del producto (Newegg) |
| Cupones de la tienda | Se activan con un clic (p. ej. "clip coupon" de Amazon) | Página del producto |
| Ofertas publicadas | Deals de la comunidad, con votos | Slickdeals, Reddit (r/buildapcsales, r/deals) |
| Atajos de la tienda | Warehouse, Open Box, reacondicionados, suscripción, otros vendedores | Enlaces directos construidos con el ID del producto |
| Historial de precios | Para saber si el precio de hoy es bueno | CamelCamelCamel, Keepa, PCPartPicker, Google Shopping |
| Cashback | Reembolso por comprar a través de un portal o extensión | Rakuten, TopCashback, Capital One Shopping, Honey |

> **Importante:** la app no "genera" cupones. Los códigos los emite cada tienda; inventarlos no funciona y es fraude. Lo que hace es **encontrar en segundos los que ya existen** para ese producto y esa tienda, en vez de buscarlos a mano en cinco webs.

## Uso rápido

```bash
cd buscador-cupones
npm install
npm start           # abre http://localhost:4000
```

Pega el enlace y pulsa **Buscar descuentos**. También acepta enlaces cortos (`amzn.to`, `a.co`) y texto con el enlace dentro.

### Desde la terminal

```bash
npm run buscar -- "https://www.amazon.com/dp/B07GBZ4Q68"
npm run buscar -- "https://www.newegg.com/p/N82E16814137790" --titulo="MSI RTX 4070 Ventus"
npm run buscar -- "<enlace>" --json
```

### API

```
GET  /api/buscar?url=<enlace>&titulo=<opcional>&precio=<opcional>&sinCache=1
POST /api/buscar   { "url": "...", "titulo": "..." }
```

Devuelve `producto`, `ofertas[]` (tipo, título, código, url, relevancia 0-100, fuente), `fuentes[]` (estado de cada fuente) y `avisos[]`.

### Bookmarklet (lo más cómodo)

En la interfaz hay un botón **🔖 Buscar cupones** para arrastrar a la barra de marcadores. Estando en cualquier producto de Amazon o Newegg, un clic lo abre en el buscador con el título y el precio leídos de la página.

Esto importa porque **Amazon y Newegg bloquean las peticiones que vienen de servidores** (datacenters, nubes). El bookmarklet manda el título desde tu navegador, así que la búsqueda en Slickdeals, Reddit y CouponFollow sale igual de buena aunque el servidor no pueda leer la página.

## Qué funciona desde dónde

| Fuente | Desde tu PC en casa | Desde un servidor en la nube |
|---|---|---|
| Slickdeals | ✅ | ✅ |
| CouponFollow | ✅ | ✅ |
| Página de Amazon / Newegg | ✅ casi siempre | ❌ bloqueada (se compensa con el bookmarklet) |
| Reddit | ✅ | ❌ suele devolver 403 |
| Enlaces de historial / cashback | ✅ | ✅ (son enlaces, no se consultan) |

CouponFollow oculta el código completo hasta que haces clic en su web; aquí se muestra el título de la promoción, la pista del código y el enlace directo a la tarjeta.

## Configuración

Copia `.env.example` a `.env`:

```
PORT=4000
CACHE_MINUTOS=10       # cada búsqueda se guarda en memoria este tiempo
TIMEOUT_SEGUNDOS=12    # espera máxima por fuente
```

## Desplegar

Es un servidor Node (Express + TypeScript con `tsx`). Funciona tal cual en Railway, Render, Fly.io o cualquier VPS:

```bash
npm install && npm start
```

Si lo despliegas en la nube, recuerda que Amazon/Newegg bloquearán la lectura directa: usa el bookmarklet o escribe el nombre del producto. Si lo corres en tu PC o en una Raspberry en casa, lee las páginas sin problema.

## Añadir otra fuente

Cada fuente es un archivo en `src/proveedores/` que implementa:

```ts
{ nombre, aplica(producto) => boolean, buscar(producto, ctx) => Promise<Oferta[]> }
```

y se registra en `src/proveedores/index.ts`. El motor las ejecuta en paralelo, deduplica y ordena (códigos primero, luego por relevancia con el producto).

## Pruebas

```bash
npm test          # parseo de URLs, extracción de códigos y precios
npm run typecheck
```
