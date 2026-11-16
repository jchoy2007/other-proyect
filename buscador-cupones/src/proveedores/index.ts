import type { Proveedor } from '../tipos.js';
import { slickdeals } from './slickdeals.js';
import { couponfollow } from './couponfollow.js';
import { reddit } from './reddit.js';
import { enlaces } from './enlaces.js';

/** Fuentes que se consultan en paralelo después de leer la página del producto */
export const proveedores: Proveedor[] = [slickdeals, couponfollow, reddit, enlaces];
