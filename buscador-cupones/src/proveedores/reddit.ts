import type { Oferta, Producto, Proveedor, Contexto } from '../tipos.js';
import { obtener, ErrorBloqueo } from '../lib/http.js';
import { extraerCodigos, extraerPrecio, relevancia } from '../lib/texto.js';

const SUBREDDITS: Record<string, string[]> = {
  newegg: ['buildapcsales', 'deals'],
  amazon: ['deals', 'buildapcsales', 'amazondeals'],
  bestbuy: ['buildapcsales', 'deals'],
  walmart: ['deals'],
  ebay: ['deals'],
  desconocida: ['deals'],
};

/** Reddit (r/buildapcsales, r/deals...): ofertas con comentarios y códigos. Suele bloquear IPs de servidores. */
export const reddit: Proveedor = {
  nombre: 'Reddit',
  aplica: () => true,

  async buscar(p: Producto, ctx: Contexto) {
    const consulta = p.id && p.tienda !== 'desconocida' && ctx.palabrasClave.length < 2 ? p.id : ctx.palabrasClave.slice(0, 4).join(' ');
    if (!consulta) return [];
    const subs = SUBREDDITS[p.tienda] ?? ['deals'];
    const url = `https://www.reddit.com/r/${subs.join('+')}/search.json?q=${encodeURIComponent(consulta)}&restrict_sr=1&sort=new&limit=15`;
    const r = await obtener(url, { timeoutMs: ctx.timeoutMs, accept: 'application/json', headers: { 'User-Agent': 'buscador-cupones/1.0' } });
    if (r.status === 403 || r.status === 429) throw new ErrorBloqueo(this.nombre, `Reddit devolvió HTTP ${r.status} (bloquea servidores; desde tu PC suele funcionar)`);
    if (r.status >= 400) throw new Error(`HTTP ${r.status}`);
    let datos: any;
    try {
      datos = JSON.parse(r.texto);
    } catch {
      throw new Error('Respuesta no válida');
    }
    const hijos: any[] = datos?.data?.children ?? [];
    const ofertas: Oferta[] = [];
    for (const h of hijos) {
      const d = h?.data;
      if (!d?.title) continue;
      const texto = `${d.title} ${d.selftext ?? ''} ${d.url ?? ''}`;
      const rel = relevancia(texto, ctx.palabrasClave, p.id);
      if (rel < 25) continue;
      const codigos = extraerCodigos(texto);
      const base = {
        fuente: this.nombre,
        titulo: d.title as string,
        descripcion: `r/${d.subreddit} · ${d.ups ?? 0} votos · ${d.num_comments ?? 0} comentarios`,
        url: `https://www.reddit.com${d.permalink}`,
        fecha: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : undefined,
        puntuacion: d.ups,
        relevancia: rel,
        precio: extraerPrecio(d.title),
      };
      if (codigos.length) for (const codigo of codigos) ofertas.push({ ...base, tipo: 'codigo', codigo });
      else ofertas.push({ ...base, tipo: 'oferta' });
    }
    return ofertas;
  },
};
