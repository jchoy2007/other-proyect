import type { Contexto, InformeFuente, Oferta, Producto, Resultado } from './tipos.js';
import { parsearProducto, esEnlaceCorto } from './lib/url.js';
import { resolverRedireccion, ErrorBloqueo } from './lib/http.js';
import { palabrasClave } from './lib/texto.js';
import { CacheTTL } from './lib/cache.js';
import { paginaProducto } from './proveedores/paginaProducto.js';
import { proveedores } from './proveedores/index.js';

export interface OpcionesBusqueda {
  /** Título del producto si ya se conoce (lo manda el bookmarklet o lo escribe el usuario) */
  titulo?: string;
  precio?: number;
  sinCache?: boolean;
  timeoutMs?: number;
}

const cache = new CacheTTL<Resultado>((parseFloat(process.env.CACHE_MINUTOS || '10') || 10) * 60_000);
const TIMEOUT_DEFECTO = (parseFloat(process.env.TIMEOUT_SEGUNDOS || '12') || 12) * 1000;

const ORDEN_TIPO: Record<Oferta['tipo'], number> = { codigo: 0, cupon: 1, oferta: 2, truco: 3, historial: 4, cashback: 5 };

export async function buscarCupones(entrada: string, opciones: OpcionesBusqueda = {}): Promise<Resultado> {
  const timeoutMs = opciones.timeoutMs ?? TIMEOUT_DEFECTO;
  let producto = parsearProducto(entrada);
  if (esEnlaceCorto(new URL(producto.urlOriginal).host)) {
    producto = parsearProducto(await resolverRedireccion(producto.urlOriginal));
    producto.urlOriginal = entrada.trim();
  }
  if (producto.tienda === 'desconocida' && !opciones.titulo) {
    // Tiendas no soportadas: se intenta igual, pero hace falta título para buscar
  }

  const claveCache = `${producto.url}|${opciones.titulo ?? ''}`;
  if (!opciones.sinCache) {
    const c = cache.obtener(claveCache);
    if (c) return { ...c, desdeCache: true };
  }

  const fuentes: InformeFuente[] = [];
  const avisos: string[] = [];
  let ofertas: Oferta[] = [];

  if (opciones.titulo) {
    producto.titulo = opciones.titulo.trim();
    producto.origenTitulo = 'usuario';
  }
  if (opciones.precio) producto.precio = opciones.precio;

  // 1) Página del producto (título, precio, cupones propios de la tienda)
  const t0 = Date.now();
  try {
    const info = await paginaProducto.leer(producto, { timeoutMs, palabrasClave: [] });
    if (!producto.titulo && info.titulo) {
      producto.titulo = info.titulo;
      producto.origenTitulo = 'pagina';
    }
    if (!producto.precio && info.precio) {
      producto.precio = info.precio;
      producto.moneda = info.moneda;
    }
    ofertas.push(...info.ofertas);
    fuentes.push({ nombre: paginaProducto.nombre, estado: 'ok', ms: Date.now() - t0, ofertas: info.ofertas.length });
  } catch (e) {
    const bloqueada = e instanceof ErrorBloqueo;
    fuentes.push({ nombre: paginaProducto.nombre, estado: bloqueada ? 'bloqueada' : 'error', detalle: mensaje(e), ms: Date.now() - t0, ofertas: 0 });
    if (bloqueada && !producto.titulo) {
      avisos.push(
        `${producto.dominio} no deja leer la página desde el servidor. Para afinar la búsqueda usa el bookmarklet (manda el título automáticamente) o escribe el nombre del producto.`,
      );
    }
  }

  const ctx: Contexto = { timeoutMs, palabrasClave: palabrasClave(producto.titulo) };
  if (!ctx.palabrasClave.length && !producto.id) {
    avisos.push('No se pudo identificar el producto: pega un enlace de producto (no de búsqueda) o escribe su nombre.');
  }

  // 2) El resto de fuentes en paralelo
  const activos = proveedores.filter((pr) => pr.aplica(producto));
  const resultados = await Promise.allSettled(
    activos.map(async (pr) => {
      const inicio = Date.now();
      try {
        const o = await pr.buscar(producto, ctx);
        fuentes.push({ nombre: pr.nombre, estado: 'ok', ms: Date.now() - inicio, ofertas: o.length });
        return o;
      } catch (e) {
        fuentes.push({ nombre: pr.nombre, estado: e instanceof ErrorBloqueo ? 'bloqueada' : 'error', detalle: mensaje(e), ms: Date.now() - inicio, ofertas: 0 });
        return [] as Oferta[];
      }
    }),
  );
  for (const r of resultados) if (r.status === 'fulfilled') ofertas.push(...r.value);

  // 3) Quitar duplicados (mismo código o misma URL) y ordenar: códigos primero, luego por relevancia
  const vistos = new Set<string>();
  ofertas = ofertas.filter((o) => {
    const k = o.codigo ? `c:${o.codigo}:${o.fuente}` : `u:${o.url}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
  ofertas.sort((a, b) => ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo] || b.relevancia - a.relevancia || (b.puntuacion ?? 0) - (a.puntuacion ?? 0));

  const resultado: Resultado = { producto, ofertas, fuentes, generadoEn: new Date().toISOString(), desdeCache: false, avisos };
  cache.guardar(claveCache, resultado);
  return resultado;
}

function mensaje(e: unknown): string {
  if (e instanceof Error) return e.name === 'AbortError' ? 'Tiempo de espera agotado' : e.message;
  return String(e);
}
