import type { Oferta, Producto, Proveedor, Contexto } from '../tipos.js';
import { obtener, ErrorBloqueo } from '../lib/http.js';
import { decodificarHtml, quitarEtiquetas, relevancia } from '../lib/texto.js';
import { dominioTienda } from '../lib/url.js';

/**
 * CouponFollow: lista los códigos y promociones vigentes de cada tienda. El código completo solo se muestra
 * al hacer clic en su web (ellos lo ocultan a propósito), así que aquí se devuelve el título de la promoción,
 * la pista del código y el enlace directo a la tarjeta para revelarlo.
 */
export const couponfollow: Proveedor = {
  nombre: 'CouponFollow',
  aplica: (p) => p.tienda !== 'desconocida',

  async buscar(p: Producto, ctx: Contexto) {
    const dominio = dominioTienda(p);
    const url = `https://couponfollow.com/site/${dominio}`;
    const r = await obtener(url, { timeoutMs: ctx.timeoutMs });
    if (r.bloqueada) throw new ErrorBloqueo(this.nombre, `CouponFollow devolvió HTTP ${r.status}`);
    if (r.status === 404) return [];
    if (r.status >= 400) throw new Error(`HTTP ${r.status}`);

    const ofertas: Oferta[] = [];
    const tarjetas = r.texto.split(/<article\s/).slice(1);
    for (const t of tarjetas) {
      const id = t.match(/data-offer-id="([^"]+)"/)?.[1];
      const tipoRaw = t.match(/data-offer-type="([^"]+)"/)?.[1] ?? 'sale';
      const titulo = t.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1];
      if (!id || !titulo) continue;
      const tituloLimpio = quitarEtiquetas(titulo);
      const conCodigo = /data-has-code="true"/.test(t);
      const pista = conCodigo ? decodificarHtml(t.match(/font-mono[^>]*>([\s\S]{0,300}?)<\/(?:span|div|button)/)?.[1] ?? '').replace(/<[^>]+>/g, '').trim() : '';
      const insignia = t.match(/data-badge-type="([^"]+)"/)?.[1];
      const usos = t.match(/(\d+)\s+(?:uses|used)\s+today/i)?.[1];
      const rel = relevancia(tituloLimpio, ctx.palabrasClave);
      const tipo: Oferta['tipo'] = conCodigo ? 'codigo' : tipoRaw === 'cashback' ? 'cashback' : 'oferta';
      ofertas.push({
        fuente: this.nombre,
        tipo,
        titulo: tituloLimpio,
        pistaCodigo: pista ? `…${pista}` : undefined,
        descripcion: [insignia === 'official' ? 'Promoción oficial de la tienda' : insignia === 'new' ? 'Nueva' : undefined, usos ? `${usos} usos hoy` : undefined, conCodigo ? 'Haz clic en "Show code" en CouponFollow para ver el código completo' : undefined]
          .filter(Boolean)
          .join(' · ') || undefined,
        url: `${url}#${id}`,
        // Las promociones de toda la tienda (envío gratis, $X al registrarte...) valen aunque no nombren el producto
        relevancia: Math.max(rel, conCodigo ? 30 : 20),
      });
    }
    // Primero las que mencionan el producto; luego las generales con código; máximo 12 para no inundar
    ofertas.sort((a, b) => b.relevancia - a.relevancia || (a.tipo === 'codigo' ? -1 : 1));
    // Todas las que mencionan el producto + como mucho 6 generales de la tienda
    const especificas = ofertas.filter((o) => o.relevancia >= 40);
    // Amazon no tiene códigos para toda la tienda: los "X% off your order" que listan son de productos sueltos y no aplican a otro producto
    const generales = p.tienda === 'amazon' ? ofertas.filter((o) => o.relevancia < 40 && o.tipo !== 'codigo').slice(0, 3) : ofertas.filter((o) => o.relevancia < 40).slice(0, 6);
    return [...especificas, ...generales];
  },
};
