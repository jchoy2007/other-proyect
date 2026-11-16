import path from 'node:path';
import { config, dirDia } from './config.js';
import { existe, log } from './lib/util.js';
import { pasoTendencias } from './pasos/tendencias.js';
import { pasoGuiones } from './pasos/guiones.js';
import { pasoVoz } from './pasos/voz.js';
import { pasoRender } from './pasos/render.js';
import { pasoPublicar } from './pasos/publicar.js';

/**
 * Ejecuta el día completo. Cada paso deja su resultado en salida/AAAA-MM-DD/ y se salta si ya está hecho,
 * así se puede relanzar sin repetir llamadas al modelo ni volver a renderizar.
 *   npm run pipeline            → todo
 *   npm run pipeline -- --desde=voz   → desde un paso (tendencias | guiones | voz | render | publicar)
 *   npm run pipeline -- --sin-publicar
 */
const args = process.argv.slice(2);
const desde = args.find((a) => a.startsWith('--desde='))?.split('=')[1] ?? 'tendencias';
const sinPublicar = args.includes('--sin-publicar');
const orden = ['tendencias', 'guiones', 'voz', 'render', 'publicar'];
const dir = dirDia();

async function main() {
  log('pipeline', `Tema: ${config.tema} · ${config.videosPorDia} videos (${config.formatos.slice(0, config.videosPorDia).join(', ')}) · carpeta ${dir}`);
  const i0 = orden.indexOf(desde);
  if (i0 < 0) throw new Error(`Paso desconocido: ${desde}`);
  const hecho = async (archivo: string) => existe(path.join(dir, archivo));

  if (i0 <= 0 && !(await hecho('tendencias.json'))) await pasoTendencias(dir);
  if (i0 <= 1 && !(await hecho('guiones.json'))) await pasoGuiones(dir);
  if (i0 <= 2) await pasoVoz(dir);
  if (i0 <= 3) await pasoRender(dir);
  if (i0 <= 4 && !sinPublicar) await pasoPublicar(dir);
  log('pipeline', 'Listo.');
}

main().catch((e) => { console.error(e); process.exit(1); });
