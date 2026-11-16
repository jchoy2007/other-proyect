import type { Oferta, Producto, Proveedor, Contexto } from '../tipos.js';
import { dominioTienda } from '../lib/url.js';

/**
 * Enlaces directos a herramientas que ya existen y que no se pueden consultar desde un servidor
 * (historial de precios, cashback, trucos de cada tienda). Se construyen con el ID del producto,
 * así que abren justo en el producto sin buscar nada.
 */
export const enlaces: Proveedor = {
  nombre: 'Herramientas externas',
  aplica: () => true,

  async buscar(p: Producto, ctx: Contexto) {
    const q = encodeURIComponent(ctx.palabrasClave.slice(0, 5).join(' ') || p.id || '');
    const dominio = dominioTienda(p);
    const o: Oferta[] = [];
    const add = (tipo: Oferta['tipo'], titulo: string, url: string, descripcion?: string, relevancia = 100) =>
      o.push({ fuente: this.nombre, tipo, titulo, url, descripcion, relevancia });

    if (p.tienda === 'amazon' && p.id) {
      const tld = p.mercado || 'com';
      const dominioCamel = tld === 'com' ? 'camelcamelcamel.com' : `${tld.replace('co.', '').replace('com.', '')}.camelcamelcamel.com`;
      const keepaDominio: Record<string, number> = { com: 1, 'co.uk': 2, de: 3, fr: 4, 'co.jp': 5, ca: 6, it: 8, es: 9, in: 10, 'com.mx': 11, 'com.br': 12, 'com.au': 13 };
      add('historial', 'Historial de precios en CamelCamelCamel', `https://${dominioCamel}/product/${p.id}`, 'Gráfica de precio y alerta por correo cuando baje');
      add('historial', 'Historial de precios en Keepa', `https://keepa.com/#!product/${keepaDominio[tld] ?? 1}-${p.id}`, 'Incluye precio de Amazon, terceros y usados');
      add('truco', 'Buscar este producto en Amazon Warehouse (reacondicionado/caja abierta)', `https://www.amazon.${tld}/s?k=${p.id}&i=warehouse-deals`, 'Suele ser 10-40% más barato con la misma garantía de devolución');
      add('truco', 'Ver todas las ofertas de vendedores para este producto', `https://www.amazon.${tld}/gp/offer-listing/${p.id}`, 'Compara nuevo, usado y otros vendedores');
      add('truco', 'Página de cupones de Amazon', `https://www.amazon.${tld}/coupons`, 'Cupones de un clic por categoría', 40);
      add('truco', 'Amazon Outlet', `https://www.amazon.${tld}/outlet`, 'Liquidaciones y excedentes de inventario', 30);
    }

    if (p.tienda === 'newegg') {
      if (ctx.palabrasClave.length) add('historial', 'Comparar precio en PCPartPicker', `https://pcpartpicker.com/search/?q=${q}`, 'Historial de precios y comparación entre tiendas (componentes de PC)');
      add('truco', 'Códigos promocionales oficiales de Newegg', 'https://www.newegg.com/promotions/promocodes', 'Newegg publica aquí sus propios códigos vigentes');
      add('truco', 'Newegg Open Box (caja abierta)', `https://www.newegg.com/p/pl?N=4131&d=${q}`, 'Mismo producto con descuento por caja abierta');
      add('truco', 'Buscar en Newegg Refurbished', `https://www.newegg.com/p/pl?d=${q}+refurbished`, 'Reacondicionados certificados', 60);
    }

    if (p.tienda === 'bestbuy' && p.id) {
      add('truco', 'Open-Box de Best Buy para este SKU', `https://www.bestbuy.com/site/searchpage.jsp?st=${p.id}&qp=condition_facet%3DCondition~Open-Box`, 'Caja abierta con garantía de Best Buy');
      add('truco', 'Outlet de Best Buy', 'https://www.bestbuy.com/site/misc/deal-of-the-day/pcmcat248000050016.c', undefined, 30);
    }

    if (p.tienda === 'walmart') add('truco', 'Walmart Clearance', `https://www.walmart.com/search?q=${q}&facet=special_offers%3AClearance`, undefined, 50);
    if (p.tienda === 'ebay' && p.id) add('truco', 'Ver ofertas en eBay Refurbished', `https://www.ebay.com/sch/i.html?_nkw=${q}&LH_ItemCondition=2000|2500`, 'Reacondicionado certificado con garantía', 60);

    if (p.tienda !== 'amazon' && ctx.palabrasClave.length) {
      add('historial', 'Buscar el mismo producto en Amazon (con historial CamelCamelCamel)', `https://www.amazon.com/s?k=${q}`, 'A veces Amazon lo tiene más barato', 50);
    }
    if (ctx.palabrasClave.length) {
      add('historial', 'Comparar precios en Google Shopping', `https://www.google.com/search?tbm=shop&q=${q}`, 'Todas las tiendas que lo venden', 70);
    }

    // Cashback: se activa antes de comprar y devuelve un porcentaje del total
    const cb: Array<[string, string, string]> = [
      ['Rakuten', `https://www.rakuten.com/${dominio.split('.')[0]}.com`, '1-10% de reembolso; bono por registrarte'],
      ['TopCashback', `https://www.topcashback.com/${dominio.split('.')[0]}/`, 'Suele dar el porcentaje más alto'],
      ['Capital One Shopping', `https://capitaloneshopping.com/s/${dominio}/coupon`, 'Extensión gratuita que prueba códigos automáticamente al pagar'],
      ['PayPal Honey', `https://www.joinhoney.com/shop/${dominio}`, 'Extensión que prueba códigos y da puntos canjeables'],
    ];
    if (p.tienda === 'amazon') cb.splice(0, 2); // Rakuten/TopCashback casi no dan cashback en Amazon
    if (p.tienda !== 'desconocida') for (const [n, url, d] of cb) add('cashback', `${n}: cashback y prueba automática de códigos en ${dominio}`, url, d, 35);

    return o;
  },
};
