export type Tienda = 'amazon' | 'newegg' | 'bestbuy' | 'walmart' | 'ebay' | 'desconocida';

export interface Producto {
  tienda: Tienda;
  /** Identificador del producto en la tienda: ASIN en Amazon, Item Number en Newegg, SKU en Best Buy, etc. */
  id?: string;
  /** URL tal cual la pasó el usuario */
  urlOriginal: string;
  /** URL canónica sin parámetros de afiliado ni rastreo */
  url: string;
  dominio: string;
  /** Mercado de Amazon (com, com.mx, es, ...) */
  mercado?: string;
  titulo?: string;
  precio?: number;
  moneda?: string;
  /** De dónde salió el título: 'usuario' | 'pagina' | 'slickdeals' */
  origenTitulo?: string;
}

export type TipoOferta =
  | 'codigo' // código promocional que se escribe al pagar
  | 'cupon' // cupón que se activa con un clic (p. ej. "clip coupon" de Amazon)
  | 'oferta' // rebaja o deal publicado en la comunidad
  | 'historial' // historial de precios / alertas de precio
  | 'cashback' // reembolso por comprar a través de un portal
  | 'truco'; // atajos de la tienda (outlet, reacondicionados, suscripción, etc.)

export interface Oferta {
  fuente: string;
  tipo: TipoOferta;
  titulo: string;
  codigo?: string;
  /** Pista parcial del código cuando la fuente lo oculta hasta hacer clic */
  pistaCodigo?: string;
  descripcion?: string;
  url: string;
  fecha?: string;
  /** Votos / puntuación en la fuente, si existe */
  puntuacion?: number;
  /** 0-100: qué tan relacionada está con el producto concreto (100 = mismo producto) */
  relevancia: number;
  precio?: number;
}

export type EstadoFuente = 'ok' | 'error' | 'bloqueada' | 'omitida';

export interface InformeFuente {
  nombre: string;
  estado: EstadoFuente;
  detalle?: string;
  ms: number;
  ofertas: number;
}

export interface Resultado {
  producto: Producto;
  ofertas: Oferta[];
  fuentes: InformeFuente[];
  generadoEn: string;
  desdeCache: boolean;
  avisos: string[];
}

export interface Contexto {
  timeoutMs: number;
  /** Palabras clave del título, ya normalizadas */
  palabrasClave: string[];
}

export interface Proveedor {
  nombre: string;
  aplica(producto: Producto): boolean;
  buscar(producto: Producto, ctx: Contexto): Promise<Oferta[]>;
}
