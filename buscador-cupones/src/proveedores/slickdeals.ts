import type { Oferta, Producto, Proveedor, Contexto } from '../tipos.js';
import { obtener, ErrorBloqueo } from '../lib/http.js';
import { decodificarHtml, extraerCodigos, extraerPrecio, quitarEtiquetas, relevancia } from '../lib/texto.js';

const TIENDA_SLUG: Record<string, string[]> = {
  amazon: ['amazon'],
  newegg: ['newegg'],
  bestbuy: ['best-buy', 'bestbuy'],
  walmart: ['walmart'],
  ebay: ['ebay'],
};

interface ItemRss {
  titulo: string;
  enlace: string;
  descripcion: string;
  contenido: string;
  fecha?: string;
  tiendaSlug?: string;
  votos?: number;
}

function parsearRss(xml: string): ItemRss[] {
  const items: ItemRss[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const b = m[1];
    const campo = (tag: string) => {
      const x = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return x ? decodificarHtml(x[1]).trim() : '';
    };
    const contenido = campo('content:encoded');
    const slug = contenido.match(/data-store-slug="([^"]+)"/)?.[1];
    const votos = contenido.match(/Thumb Score:\s*(-?\d+)/)?.[1];
    items.push({
      titulo: campo('title'),
      enlace: campo('link').replace(/\?utm_source=rss.*$/, ''),
      descripcion: campo('description'),
      contenido,
      fecha: campo('pubDate') || undefined,
      tiendaSlug: slug,
      votos: votos ? parseInt(votos, 10) : undefined,
    });
  }
  return items;
}

async function buscarRss(consulta: string, timeoutMs: number): Promise<ItemRss[]> {
  const url = `https://slickdeals.net/newsearch.php?q=${encodeURIComponent(consulta)}&searcharea=deals&searchin=first&rss=1`;
  const r = await obtener(url, { timeoutMs, accept: 'application/rss+xml,application/xml,text/xml,*/*' });
  if (r.bloqueada) throw new ErrorBloqueo('Slickdeals', `Slickdeals devolvió HTTP ${r.status}`);
  if (r.status >= 400) throw new Error(`HTTP ${r.status}`);
  return parsearRss(r.texto);
}

/**
 * Slickdeals: comunidad de ofertas con votos. Se busca por identificador del producto (ASIN, item number)
 * y por las palabras clave del título. Los códigos escritos en el deal ("use code XYZ") se extraen.
 */
export const slickdeals: Proveedor = {
  nombre: 'Slickdeals',
  aplica: () => true,

  async buscar(p: Producto, ctx: Contexto) {
    const consultas: string[] = [];
    if (p.id && p.tienda !== 'desconocida') consultas.push(p.id);
    if (ctx.palabrasClave.length >= 2) consultas.push(ctx.palabrasClave.slice(0, 5).join(' '));
    if (!consultas.length) return [];

    const vistos = new Set<string>();
    const ofertas: Oferta[] = [];
    const slugs = TIENDA_SLUG[p.tienda] ?? [];
    const resultados = await Promise.allSettled(consultas.map((q) => buscarRss(q, ctx.timeoutMs)));
    const errores = resultados.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (errores.length === resultados.length) throw errores[0].reason;

    for (const r of resultados) {
      if (r.status !== 'fulfilled') continue;
      for (const it of r.value) {
        if (vistos.has(it.enlace)) continue;
        vistos.add(it.enlace);
        const textoCompleto = `${it.titulo} ${quitarEtiquetas(it.contenido)}`;
        let rel = relevancia(textoCompleto, ctx.palabrasClave, p.id);
        const mismaTienda = !slugs.length || (it.tiendaSlug ? slugs.includes(it.tiendaSlug) : /amazon|newegg|bestbuy|walmart|ebay/i.test(it.descripcion) === false);
        if (!mismaTienda) rel = Math.round(rel * 0.6); // Otra tienda: sigue siendo útil para comparar precio
        if (rel < 25) continue;
        const codigos = extraerCodigos(textoCompleto);
        const precio = extraerPrecio(it.titulo);
        const tienda = it.tiendaSlug ? it.tiendaSlug.replace(/-/g, ' ') : undefined;
        const base: Omit<Oferta, 'tipo' | 'codigo'> = {
          fuente: this.nombre,
          titulo: it.titulo,
          descripcion: [tienda ? `Tienda: ${tienda}` : undefined, it.votos !== undefined ? `Votos: ${it.votos}` : undefined].filter(Boolean).join(' · ') || undefined,
          url: it.enlace,
          fecha: it.fecha,
          puntuacion: it.votos,
          relevancia: rel,
          precio,
        };
        if (codigos.length) for (const codigo of codigos) ofertas.push({ ...base, tipo: 'codigo', codigo });
        else ofertas.push({ ...base, tipo: 'oferta' });
      }
    }
    return ofertas;
  },
};
