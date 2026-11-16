import type { Oferta, Producto, Proveedor, Contexto } from '../tipos.js';
import { obtener, ErrorBloqueo } from '../lib/http.js';
import { decodificarHtml, extraerCodigos, extraerPrecio, quitarEtiquetas } from '../lib/texto.js';

/**
 * Lee la página del producto para sacar título, precio y descuentos que la propia tienda muestra
 * (cupón "clip" de Amazon, precio tachado, códigos promocionales de Newegg, etc.).
 * Amazon y Newegg suelen bloquear IPs de servidores: en ese caso el proveedor avisa y el resto
 * de fuentes siguen funcionando con el título que mande el bookmarklet o el usuario.
 */
export const paginaProducto: Proveedor & { leer(p: Producto, ctx: Contexto): Promise<{ titulo?: string; precio?: number; moneda?: string; ofertas: Oferta[] }> } = {
  nombre: 'Página del producto',
  aplica: () => true,

  async leer(p, ctx) {
    const r = await obtener(p.url, { timeoutMs: ctx.timeoutMs });
    if (r.bloqueada) throw new ErrorBloqueo(this.nombre, `${p.dominio} bloquea el acceso automático desde este servidor (HTTP ${r.status}).`);
    if (r.status >= 400) throw new Error(`HTTP ${r.status}`);
    const html = r.texto;
    const ofertas: Oferta[] = [];

    const titulo = sacarTitulo(html, p);
    const { precio, moneda } = sacarPrecio(html, p);

    if (p.tienda === 'amazon') {
      // Cupón de un clic ("Apply $10 coupon" / "Save 15% with coupon")
      const cupon = html.match(/(?:Apply|Save|Ahorra|Aplicar)\s+([^<]{0,20}?)(?:\s+(?:coupon|cupón|with coupon|extra))[^<]{0,40}/i);
      if (cupon) {
        ofertas.push({
          fuente: this.nombre,
          tipo: 'cupon',
          titulo: `Cupón de Amazon: ${quitarEtiquetas(cupon[0])}`,
          descripcion: 'Aparece en la página del producto, debajo del precio. Se activa con un clic antes de añadir al carrito.',
          url: p.url,
          relevancia: 100,
        });
      }
      const tachado = html.match(/class="a-price a-text-price"[^>]*>\s*<span class="a-offscreen">([^<]+)</i) || html.match(/basisPrice[^>]*>\s*<span class="a-offscreen">([^<]+)</i);
      const listado = tachado ? extraerPrecio(decodificarHtml(tachado[1])) : undefined;
      if (listado && precio && listado > precio) {
        const pct = Math.round((1 - precio / listado) * 100);
        ofertas.push({
          fuente: this.nombre,
          tipo: 'oferta',
          titulo: `Ya está rebajado un ${pct}% (precio de lista ${listado} → ${precio})`,
          url: p.url,
          relevancia: 100,
          precio,
        });
      }
      if (/dealBadge|Limited time deal|Oferta por tiempo limitado|Lightning Deal|Oferta flash/i.test(html)) {
        ofertas.push({ fuente: this.nombre, tipo: 'oferta', titulo: 'Tiene una oferta por tiempo limitado activa en Amazon', url: p.url, relevancia: 100 });
      }
      if (/Subscribe\s*&amp;\s*Save|Suscríbete y ahorra|snsAccordion/i.test(html)) {
        ofertas.push({
          fuente: this.nombre,
          tipo: 'truco',
          titulo: 'Admite "Suscríbete y ahorra": 5-15% extra y puedes cancelar tras el primer envío',
          url: p.url,
          relevancia: 100,
        });
      }
      if (/Used\s*&amp;\s*new|De segunda mano y nuevo|olpLinkWidget|#aod-offer/i.test(html)) {
        const base = p.url.replace(/\/dp\/.*$/, '');
        ofertas.push({
          fuente: this.nombre,
          tipo: 'truco',
          titulo: 'Hay otros vendedores: compara ofertas de nuevo y reacondicionado',
          url: `${base}/gp/offer-listing/${p.id}`,
          relevancia: 100,
        });
      }
    }

    if (p.tienda === 'newegg') {
      const textoPlano = quitarEtiquetas(html);
      for (const codigo of extraerCodigos(textoPlano)) {
        ofertas.push({
          fuente: this.nombre,
          tipo: 'codigo',
          titulo: `Código promocional mostrado por Newegg en el producto`,
          codigo,
          url: p.url,
          relevancia: 100,
        });
      }
      if (/Combo\s+(?:Deals|Savings)|combo-savings/i.test(html)) {
        ofertas.push({ fuente: this.nombre, tipo: 'truco', titulo: 'Tiene combos con descuento al comprarlo junto a otro artículo', url: p.url, relevancia: 100 });
      }
      if (/Open Box/i.test(html)) {
        ofertas.push({ fuente: this.nombre, tipo: 'truco', titulo: 'Existe versión Open Box (caja abierta) más barata del mismo producto', url: p.url, relevancia: 100 });
      }
    }

    if (p.tienda === 'bestbuy' && /Open-Box|open box/i.test(html)) {
      ofertas.push({ fuente: this.nombre, tipo: 'truco', titulo: 'Best Buy tiene unidades Open-Box de este producto', url: p.url, relevancia: 100 });
    }

    return { titulo, precio, moneda, ofertas };
  },

  async buscar(p, ctx) {
    return (await this.leer(p, ctx)).ofertas;
  },
};

function sacarTitulo(html: string, p: Producto): string | undefined {
  const candidatos = [
    /id="productTitle"[^>]*>\s*([^<]+?)\s*</i,
    /<meta\s+property="og:title"\s+content="([^"]+)"/i,
    /<meta\s+name="title"\s+content="([^"]+)"/i,
    /<h1[^>]*class="[^"]*product-title[^"]*"[^>]*>\s*([^<]+?)\s*</i,
    /<h1[^>]*>\s*([^<]{10,200}?)\s*<\/h1>/i,
    /<title>\s*([^<]+?)\s*<\/title>/i,
  ];
  for (const re of candidatos) {
    const m = html.match(re);
    if (m) {
      let t = decodificarHtml(m[1]).replace(/\s+/g, ' ').trim();
      t = t.replace(/\s*[-|:]\s*(Amazon\.[a-z.]+|Newegg\.com|Best Buy|Walmart\.com|eBay)\s*$/i, '');
      t = t.replace(/^Amazon\.[a-z.]+\s*:\s*/i, '');
      if (t.length > 8 && !/^(amazon|newegg)\.?/i.test(t)) return t;
    }
  }
  return undefined;
}

function sacarPrecio(html: string, p: Producto): { precio?: number; moneda?: string } {
  const candidatos = [
    /id="corePrice_feature_div"[\s\S]{0,2000}?class="a-offscreen">([^<]+)</i,
    /id="corePriceDisplay[^"]*"[\s\S]{0,2000}?class="a-offscreen">([^<]+)</i,
    /class="price-current"[^>]*>[\s\S]{0,200}?<strong>([^<]+)<\/strong><sup>([^<]+)</i,
    /<meta\s+(?:property|itemprop)="(?:product:price:amount|price)"\s+content="([^"]+)"/i,
    /"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/,
  ];
  for (const re of candidatos) {
    const m = html.match(re);
    if (m) {
      const texto = m[2] ? `$${m[1]}${m[2]}` : decodificarHtml(m[1]);
      const precio = extraerPrecio(texto.startsWith('$') || /[€£]/.test(texto) ? texto : `$${texto}`);
      if (precio) {
        const moneda = /€/.test(texto) ? 'EUR' : /£/.test(texto) ? 'GBP' : p.mercado === 'com.mx' ? 'MXN' : p.mercado === 'ca' ? 'CAD' : 'USD';
        return { precio, moneda };
      }
    }
  }
  return {};
}
