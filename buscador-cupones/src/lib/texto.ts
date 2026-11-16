const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#039': "'" };

export function decodificarHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, ent: string) => {
      const e = ent.toLowerCase();
      if (e.startsWith('#x')) return String.fromCodePoint(parseInt(e.slice(2), 16));
      if (e.startsWith('#')) return String.fromCodePoint(parseInt(e.slice(1), 10));
      return ENTIDADES[e] ?? m;
    });
}

export function quitarEtiquetas(html: string): string {
  return decodificarHtml(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

const PALABRAS_VACIAS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'your', 'new', 'free', 'off', 'sale', 'deal', 'deals', 'amazon', 'newegg',
  'walmart', 'ebay', 'best', 'buy', 'bestbuy', 'con', 'para', 'por', 'del', 'las', 'los', 'una', 'uno', 'que', 'pack', 'inch',
  'pulgadas', 'black', 'white', 'negro', 'blanco', 'color', 'edition', 'version', 'model', 'compatible', 'only', 'shipping',
]);

/** Extrae las palabras más distintivas de un título de producto (marca, modelo, cifras...) */
export function palabrasClave(titulo: string | undefined, max = 8): string[] {
  if (!titulo) return [];
  const limpio = titulo
    .toLowerCase()
    .replace(/[|,:;()[\]{}"'“”‘’]/g, ' ')
    .replace(/\s+-\s+/g, ' ');
  const vistas = new Set<string>();
  const salida: string[] = [];
  for (const w of limpio.split(/\s+/)) {
    const t = w.replace(/[^a-z0-9.+-]/g, '');
    if (t.length < 2 || PALABRAS_VACIAS.has(t) || vistas.has(t)) continue;
    // Las cifras cortas tipo "2" o "16" aportan poco si van sueltas
    if (/^\d{1,2}$/.test(t)) continue;
    vistas.add(t);
    salida.push(t);
    if (salida.length >= max) break;
  }
  return salida;
}

/** 0-100: proporción de palabras clave del producto que aparecen en un texto */
export function relevancia(texto: string, claves: string[], id?: string): number {
  const t = texto.toLowerCase();
  if (id && t.includes(id.toLowerCase())) return 100;
  if (!claves.length) return 0;
  let aciertos = 0;
  for (const k of claves) if (t.includes(k)) aciertos++;
  return Math.round((aciertos / claves.length) * 95);
}

/** Extrae un precio (número) de textos como "$1,299.99", "1.299,99 €", "US$ 45" */
export function extraerPrecio(texto: string): number | undefined {
  const num = String.raw`(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+(?:[.,]\d{1,2})?)`;
  const m = texto.match(new RegExp(String.raw`(?:\$|US\$|USD|€|£|MXN|CAD)\s?${num}`)) || texto.match(new RegExp(String.raw`${num}\s?(?:€|£|USD|MXN|CAD)`));
  if (!m) return undefined;
  let n = m[1];
  const ultimoPunto = n.lastIndexOf('.');
  const ultimaComa = n.lastIndexOf(',');
  if (ultimoPunto >= 0 && ultimaComa >= 0) {
    // Los dos separadores: el último es el decimal
    n = ultimaComa > ultimoPunto ? n.replace(/\./g, '').replace(',', '.') : n.replace(/,/g, '');
  } else if (ultimaComa >= 0) {
    n = /,\d{2}$/.test(n) ? n.replace(',', '.') : n.replace(/,/g, '');
  } else if (ultimoPunto >= 0 && /\.\d{3}$/.test(n)) {
    n = n.replace(/\./g, ''); // "1.299" europeo = 1299
  }
  const v = parseFloat(n);
  return Number.isFinite(v) ? v : undefined;
}

/** Busca códigos promocionales escritos en texto libre ("use code SAVE20", "w/ code ABC123", "cupón XYZ") */
export function extraerCodigos(texto: string): string[] {
  const codigos = new Set<string>();
  const re = /(?:promo\s*code|coupon\s*code|code|c[oó]digo|cup[oó]n|coupon|w\/\s*code|with\s*code|codigo)\s*[:=]?\s*["'“]?([A-Z0-9][A-Z0-9-]{3,24})["'”]?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const c = m[1].toUpperCase();
    if (/^\d+$/.test(c) && c.length < 6) continue; // "code 20" no es un código
    if (['FREE', 'SALE', 'DEAL', 'PRICE', 'CHECKOUT', 'NEEDED', 'REQUIRED', 'EXPIRES', 'VALID', 'CLICK', 'HERE', 'LINK', 'BELOW', 'ABOVE', 'INSIDE', 'TODAY', 'ONLY', 'WITH', 'FROM', 'THIS', 'THAT', 'YOUR', 'SHOWN', 'APPLIED', 'AUTO', 'AUTOMATICALLY'].includes(c)) continue;
    codigos.add(c);
  }
  return [...codigos];
}

export function recortar(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}
