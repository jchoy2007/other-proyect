const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export interface Respuesta {
  status: number;
  url: string;
  texto: string;
  bloqueada: boolean;
}

export class ErrorBloqueo extends Error {
  constructor(public fuente: string, mensaje: string) {
    super(mensaje);
  }
}

/** Patrones que delatan una página anti-bot en vez de contenido real */
const PATRONES_BLOQUEO = [
  /To discuss automated access to Amazon data/i,
  /api-services-support@amazon\.com/i,
  /<title>[^<]*Robot Check/i,
  /validateCaptcha/i,
  /Are you a human\?/i,
  /Access Denied/i,
  /Just a moment\.\.\./i, // Cloudflare
  /cf-browser-verification/i,
  /Reference #\d+\.[0-9a-f]+\.\d+\.[0-9a-f]+/i, // Akamai
  /Request blocked/i,
];

export function pareceBloqueo(status: number, html: string): boolean {
  if (status === 403 || status === 429 || status === 503) return true;
  const inicio = html.slice(0, 20000);
  return PATRONES_BLOQUEO.some((re) => re.test(inicio));
}

export async function obtener(url: string, opciones: { timeoutMs?: number; headers?: Record<string, string>; accept?: string } = {}): Promise<Respuesta> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opciones.timeoutMs ?? 12000);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: opciones.accept ?? 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        ...opciones.headers,
      },
    });
    const texto = await r.text();
    return { status: r.status, url: r.url, texto, bloqueada: pareceBloqueo(r.status, texto) };
  } finally {
    clearTimeout(t);
  }
}

/** Sigue redirecciones de un enlace corto (amzn.to, a.co) y devuelve la URL final */
export async function resolverRedireccion(url: string, timeoutMs = 8000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    return r.url || url;
  } catch {
    return url;
  } finally {
    clearTimeout(t);
  }
}
