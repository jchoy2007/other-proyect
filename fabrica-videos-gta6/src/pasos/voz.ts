import fs from 'node:fs/promises';
import path from 'node:path';
import { config, dirDia } from '../config.js';
import type { Guion } from '../tipos.js';
import { duracionMedia, ejecutar, existe, leerJson, log } from '../lib/util.js';

/**
 * Voz en off con edge-tts (voces neuronales de Microsoft, gratis, sin clave).
 * Genera un mp3 por escena (para saber cuánto dura cada una) y luego los une.
 * Si existe ELEVENLABS_API_KEY se puede cambiar aquí por ElevenLabs; la interfaz es la misma.
 */
export async function sintetizarEscena(texto: string, destino: string): Promise<void> {
  const python = (await existe(config.pythonTts)) ? config.pythonTts : 'python3';
  await ejecutar(python, ['-m', 'edge_tts', '--voice', config.voz, '--rate', config.vozVelocidad, '--text', texto, '--write-media', destino], {
    env: { SSL_CERT_FILE: process.env.SSL_CERT_FILE ?? '' },
  });
}

export interface AudioGuion {
  archivo: string;
  duraciones: number[]; // segundos por escena
  total: number;
}

export async function producirVoz(guion: Guion, dir: string): Promise<AudioGuion> {
  const carpeta = path.join(dir, guion.id, 'voz');
  await fs.mkdir(carpeta, { recursive: true });
  const partes: string[] = [];
  const duraciones: number[] = [];
  for (let i = 0; i < guion.escenas.length; i++) {
    const archivo = path.join(carpeta, `escena-${String(i + 1).padStart(2, '0')}.mp3`);
    if (!(await existe(archivo))) await sintetizarEscena(guion.escenas[i].voz, archivo);
    partes.push(archivo);
    duraciones.push(await duracionMedia(archivo));
  }
  // Unir con un silencio corto entre escenas
  const lista = path.join(carpeta, 'lista.txt');
  await fs.writeFile(lista, partes.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));
  const salida = path.join(dir, guion.id, 'voz.mp3');
  await ejecutar('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-c:a', 'libmp3lame', '-q:a', '3', salida]);
  const total = await duracionMedia(salida);
  log('voz', `${guion.id}: ${guion.escenas.length} escenas, ${total.toFixed(1)} s`);
  return { archivo: salida, duraciones, total };
}

export async function pasoVoz(dir = dirDia()): Promise<void> {
  const guiones = await leerJson<Guion[]>(path.join(dir, 'guiones.json'));
  for (const g of guiones) {
    try {
      const a = await producirVoz(g, dir);
      await fs.writeFile(path.join(dir, g.id, 'voz.json'), JSON.stringify(a, null, 2));
    } catch (e) {
      log('voz', `ERROR ${g.id}: ${(e as Error).message}`);
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('voz.ts')) {
  pasoVoz().catch((e) => { console.error(e); process.exit(1); });
}
