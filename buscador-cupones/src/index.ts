import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscarCupones } from './motor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

/** Búsqueda: GET /api/buscar?url=...&titulo=...&precio=...&sinCache=1  |  POST /api/buscar {url, titulo, precio} */
async function manejarBusqueda(req: express.Request, res: express.Response) {
  const datos = { ...req.query, ...(req.body ?? {}) } as Record<string, string>;
  const url = (datos.url || datos.u || '').toString();
  if (!url) return res.status(400).json({ error: 'Falta el parámetro "url" con el enlace del producto.' });
  try {
    const precio = datos.precio ? parseFloat(String(datos.precio).replace(/[^\d.]/g, '')) : undefined;
    const resultado = await buscarCupones(url, {
      titulo: datos.titulo ? String(datos.titulo).slice(0, 300) : undefined,
      precio: precio && Number.isFinite(precio) ? precio : undefined,
      sinCache: datos.sinCache === '1' || datos.sinCache === 'true',
    });
    res.json(resultado);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Error desconocido' });
  }
}
app.get('/api/buscar', manejarBusqueda);
app.post('/api/buscar', manejarBusqueda);

/**
 * Bookmarklet: se arrastra a la barra de marcadores. Estando en cualquier producto de Amazon/Newegg,
 * un clic abre el buscador con la URL, el título y el precio leídos directamente de la página
 * (así no importa que la tienda bloquee al servidor).
 */
app.get('/bookmarklet.js', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const js = `(function(){
var t=(document.querySelector('#productTitle')||document.querySelector('h1.product-title')||document.querySelector('h1')||{}).textContent||document.title;
var pe=document.querySelector('#corePrice_feature_div .a-offscreen, #corePriceDisplay_desktop_feature_div .a-offscreen, .price-current, [data-testid="customer-price"], [itemprop="price"]');
var p=pe?(pe.getAttribute('content')||pe.textContent):'';
location.href='${base}/?url='+encodeURIComponent(location.href)+'&titulo='+encodeURIComponent(t.trim().slice(0,300))+'&precio='+encodeURIComponent((p||'').trim().slice(0,30))+'&auto=1';
})();`;
  res.type('application/javascript').send(js);
});

app.get('/api/salud', (_req, res) => res.json({ ok: true, fecha: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Buscador de cupones escuchando en http://localhost:${PORT}`);
});
