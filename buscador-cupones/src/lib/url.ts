import type { Producto, Tienda } from '../tipos.js';

const ASIN = /\b([A-Z0-9]{10})\b/;

/** Parámetros de afiliado y rastreo que se eliminan al limpiar la URL */
const PARAMS_BASURA = /^(tag|ref|ref_|linkCode|linkId|camp|creative|creativeASIN|ascsubtag|psc|th|pd_rd_.*|pf_rd_.*|utm_.*|fbclid|gclid|msclkid|cm_mmc|irclickid|irgwc|affid|aff|srsltid|_encoding|keywords|qid|sr|sprefix|crid|dib|dib_tag|content-id|pd_rd_i|smid|m)$/i;

export function detectarTienda(host: string): { tienda: Tienda; mercado?: string } {
  const h = host.toLowerCase().replace(/^www\./, '');
  const amazon = h.match(/^(?:[a-z0-9-]+\.)?amazon\.([a-z.]+)$/);
  if (amazon) return { tienda: 'amazon', mercado: amazon[1] };
  if (h === 'amzn.to' || h === 'a.co' || h === 'amzn.eu' || h === 'amzn.asia') return { tienda: 'amazon', mercado: 'com' };
  if (/(^|\.)newegg\.(com|ca)$/.test(h)) return { tienda: 'newegg' };
  if (/(^|\.)bestbuy\.(com|ca)$/.test(h)) return { tienda: 'bestbuy' };
  if (/(^|\.)walmart\.(com|ca|com\.mx)$/.test(h)) return { tienda: 'walmart' };
  if (/(^|\.)ebay\.[a-z.]+$/.test(h)) return { tienda: 'ebay' };
  return { tienda: 'desconocida' };
}

export function esEnlaceCorto(host: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, '');
  return ['amzn.to', 'a.co', 'amzn.eu', 'amzn.asia'].includes(h);
}

function extraerId(tienda: Tienda, u: URL): string | undefined {
  const path = u.pathname;
  switch (tienda) {
    case 'amazon': {
      const m =
        path.match(/\/(?:dp|gp\/product|gp\/aw\/d|product|exec\/obidos\/asin|o\/asin)\/([A-Z0-9]{10})(?:[/?]|$)/i) ||
        path.match(/\/([A-Z0-9]{10})(?:[/?]|$)/) ||
        (u.searchParams.get('asin') || '').match(ASIN);
      return m ? m[1].toUpperCase() : undefined;
    }
    case 'newegg': {
      const m =
        path.match(/\/p\/((?:N82E|9SIA|1[A-Z0-9]{3}-)[A-Za-z0-9-]+)/i) ||
        path.match(/\/p\/([A-Za-z0-9]{2,}[A-Za-z0-9-]*)(?:[/?]|$)/i) ||
        (u.searchParams.get('Item') || u.searchParams.get('item') || '').match(/([A-Za-z0-9-]{6,})/);
      return m ? m[1] : undefined;
    }
    case 'bestbuy': {
      const m = (u.searchParams.get('skuId') || '').match(/(\d{5,})/) || path.match(/\/(\d{7,})\.p(?:[/?]|$)/);
      return m ? m[1] : undefined;
    }
    case 'walmart': {
      const m = path.match(/\/ip\/(?:[^/]+\/)?(\d{6,})(?:[/?]|$)/);
      return m ? m[1] : undefined;
    }
    case 'ebay': {
      const m = path.match(/\/itm\/(?:[^/]+\/)?(\d{9,})(?:[/?]|$)/);
      return m ? m[1] : undefined;
    }
    default:
      return undefined;
  }
}

function urlCanonica(tienda: Tienda, u: URL, id?: string, mercado?: string): string {
  const host = u.host.toLowerCase();
  if (tienda === 'amazon' && id) return `https://www.amazon.${mercado || 'com'}/dp/${id}`;
  if (tienda === 'newegg' && id) return `https://${host.replace(/^(?!www\.)/, 'www.')}/p/${id}`;
  if (tienda === 'bestbuy' && id) return `https://www.bestbuy.com/site/${id}.p?skuId=${id}`;
  if (tienda === 'walmart' && id) return `https://${host.replace(/^(?!www\.)/, 'www.')}/ip/${id}`;
  if (tienda === 'ebay' && id) return `https://${host}/itm/${id}`;
  // Tienda desconocida: solo se quitan los parámetros de rastreo
  const limpia = new URL(u.toString());
  for (const k of [...limpia.searchParams.keys()]) if (PARAMS_BASURA.test(k)) limpia.searchParams.delete(k);
  limpia.hash = '';
  return limpia.toString();
}

export function normalizarEntrada(texto: string): string {
  let t = texto.trim();
  // Permite pegar texto con la URL dentro (p. ej. "mira esto https://...")
  const m = t.match(/https?:\/\/[^\s"'<>]+/i);
  if (m) t = m[0];
  if (!/^https?:\/\//i.test(t)) t = 'https://' + t;
  return t.replace(/[),.;]+$/, '');
}

export function parsearProducto(entrada: string): Producto {
  const original = normalizarEntrada(entrada);
  let u: URL;
  try {
    u = new URL(original);
  } catch {
    throw new Error('El enlace no es una URL válida.');
  }
  const { tienda, mercado } = detectarTienda(u.host);
  const id = extraerId(tienda, u);
  return {
    tienda,
    id,
    mercado,
    urlOriginal: original,
    url: urlCanonica(tienda, u, id, mercado),
    dominio: u.host.toLowerCase().replace(/^www\./, ''),
  };
}

/** Dominio "comercial" que usan las webs de cupones (amazon.com, newegg.com, bestbuy.com...) */
export function dominioTienda(p: Producto): string {
  switch (p.tienda) {
    case 'amazon':
      return `amazon.${p.mercado || 'com'}`;
    case 'newegg':
      return p.dominio.endsWith('.ca') ? 'newegg.ca' : 'newegg.com';
    case 'bestbuy':
      return 'bestbuy.com';
    case 'walmart':
      return 'walmart.com';
    case 'ebay':
      return 'ebay.com';
    default:
      return p.dominio;
  }
}
