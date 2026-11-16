import fs from 'node:fs/promises';
import path from 'node:path';
import { config, dirDia } from '../config.js';
import type { Guion } from '../tipos.js';
import type { AudioGuion } from './voz.js';
import { duracionMedia, ejecutar, existe, leerJson, log } from '../lib/util.js';

const FORMATO = {
  short: { w: 1080, h: 1920, fuenteTitulo: 84, fuenteSub: 54 },
  largo: { w: 1920, h: 1080, fuenteTitulo: 72, fuenteSub: 44 },
};

interface Recurso { ruta: string; tipo: 'video' | 'imagen'; palabras: string[] }

/** Indexa media/gameplay y media/imagenes; las palabras clave salen del nombre del archivo (ej. "vice-city-night-drive.mp4") */
async function indexarMedia(): Promise<Recurso[]> {
  const recursos: Recurso[] = [];
  for (const [sub, tipo] of [['gameplay', 'video'], ['imagenes', 'imagen']] as const) {
    const carpeta = path.join(config.dirMedia, sub);
    let archivos: string[] = [];
    try { archivos = await fs.readdir(carpeta); } catch { continue; }
    for (const a of archivos) {
      if (a.startsWith('.')) continue;
      const ext = path.extname(a).toLowerCase();
      if (tipo === 'video' && !['.mp4', '.mov', '.mkv', '.webm'].includes(ext)) continue;
      if (tipo === 'imagen' && !['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
      recursos.push({ ruta: path.join(carpeta, a), tipo, palabras: path.basename(a, ext).toLowerCase().split(/[-_ .]+/).filter(Boolean) });
    }
  }
  return recursos;
}

function elegir(recursos: Recurso[], clave: string, usados: Map<string, number>): Recurso | undefined {
  const claves = clave.toLowerCase().split(/\s+/);
  let mejor: Recurso | undefined; let mejorPts = -1;
  for (const r of recursos) {
    const pts = claves.filter((k) => r.palabras.some((p) => p.includes(k) || k.includes(p))).length - (usados.get(r.ruta) ?? 0) * 0.4 + Math.random() * 0.3;
    if (pts > mejorPts) { mejorPts = pts; mejor = r; }
  }
  if (mejor) usados.set(mejor.ruta, (usados.get(mejor.ruta) ?? 0) + 1);
  return mejor;
}

function escapar(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/'/g, "\u2019").replace(/:/g, '\\:').replace(/%/g, '\\%').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

/** Monta el video: un segmento por escena (clip o imagen con zoom lento, o fondo generado si no hay media), texto en pantalla, voz y música opcional */
export async function renderizar(guion: Guion, audio: AudioGuion, dir: string): Promise<string> {
  const f = FORMATO[guion.formato];
  const carpeta = path.join(dir, guion.id, 'segmentos');
  await fs.mkdir(carpeta, { recursive: true });
  const recursos = await indexarMedia();
  const usados = new Map<string, number>();
  const offsetsClip = new Map<string, number>();
  const segmentos: string[] = [];
  const fuente = (await existe('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')) ? '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' : '';
  const fontOpt = fuente ? `fontfile=${fuente}:` : '';

  for (let i = 0; i < guion.escenas.length; i++) {
    const esc = guion.escenas[i];
    const dur = Math.max(1.2, audio.duraciones[i] + 0.25);
    const salida = path.join(carpeta, `seg-${String(i + 1).padStart(2, '0')}.mp4`);
    const r = elegir(recursos, esc.claveVisual, usados);
    const texto = escapar(esc.textoPantalla.toUpperCase());
    const y = guion.formato === 'short' ? 'h*0.72' : 'h*0.82';
    const filtroTexto = `drawtext=${fontOpt}text='${texto}':fontsize=${f.fuenteSub}:fontcolor=white:borderw=4:bordercolor=black@0.85:x=(w-text_w)/2:y=${y}:line_spacing=10`;
    const escala = `scale=${f.w}:${f.h}:force_original_aspect_ratio=increase,crop=${f.w}:${f.h}`;
    const args = ['-y', '-v', 'error'];
    if (r?.tipo === 'video') {
      const total = await duracionMedia(r.ruta);
      const inicio = Math.min(offsetsClip.get(r.ruta) ?? 0, Math.max(0, total - dur));
      offsetsClip.set(r.ruta, inicio + dur);
      args.push('-ss', inicio.toFixed(2), '-t', dur.toFixed(2), '-i', r.ruta, '-an', '-vf', `${escala},${filtroTexto},format=yuv420p`);
    } else if (r?.tipo === 'imagen') {
      const frames = Math.ceil(dur * 30);
      args.push('-loop', '1', '-t', dur.toFixed(2), '-i', r.ruta, '-an', '-vf', `scale=${f.w * 1.2}:${f.h * 1.2}:force_original_aspect_ratio=increase,crop=${f.w * 1.2}:${f.h * 1.2},zoompan=z='min(zoom+0.0008,1.15)':d=${frames}:s=${f.w}x${f.h}:fps=30,${filtroTexto},format=yuv420p`);
    } else {
      // Sin media: fondo degradado animado para que el pipeline no se detenga (sustituir por clips reales)
      args.push('-f', 'lavfi', '-t', dur.toFixed(2), '-i', `color=c=0x12131a:s=${f.w}x${f.h}:r=30`, '-vf', `geq=r='40+30*sin(X/180+T)':g='20+20*sin(Y/220+T/2)':b='70+40*sin((X+Y)/300+T/3)',${filtroTexto},format=yuv420p`);
    }
    args.push('-r', '30', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', salida);
    await ejecutar('ffmpeg', args);
    segmentos.push(salida);
  }

  const lista = path.join(carpeta, 'lista.txt');
  await fs.writeFile(lista, segmentos.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));
  const sinAudio = path.join(dir, guion.id, 'video-mudo.mp4');
  await ejecutar('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', sinAudio]);

  // Título al inicio (gancho) + voz + música de fondo si hay
  const final = path.join(dir, guion.id, `${guion.id}.mp4`);
  const musica = (await fs.readdir(path.join(config.dirMedia, 'musica')).catch(() => [])).filter((m) => /\.(mp3|m4a|wav)$/i.test(m));
  const args = ['-y', '-v', 'error', '-i', sinAudio, '-i', audio.archivo];
  let mapaAudio = '1:a';
  let filtroAudio = '';
  if (musica.length) {
    args.push('-stream_loop', '-1', '-i', path.join(config.dirMedia, 'musica', musica[Math.floor(Math.random() * musica.length)]));
    filtroAudio = `[2:a]volume=0.12[m];[1:a][m]amix=inputs=2:duration=first:dropout_transition=2[a]`;
    mapaAudio = '[a]';
  }
  const gancho = escapar(guion.gancho.toUpperCase());
  const filtroGancho = `drawtext=${fontOpt}text='${gancho}':fontsize=${f.fuenteTitulo}:fontcolor=yellow:borderw=5:bordercolor=black:x=(w-text_w)/2:y=h*0.18:enable='lt(t,2.5)'`;
  const complejo = `${filtroAudio ? filtroAudio + ';' : ''}[0:v]${filtroGancho}[v]`;
  args.push('-filter_complex', complejo, '-map', '[v]', '-map', mapaAudio, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', final);
  await ejecutar('ffmpeg', args);
  log('render', `${guion.id}: ${final} (${(await duracionMedia(final)).toFixed(1)} s, ${f.w}x${f.h})`);
  return final;
}

export async function pasoRender(dir = dirDia()): Promise<void> {
  const guiones = await leerJson<Guion[]>(path.join(dir, 'guiones.json'));
  for (const g of guiones) {
    try {
      const audio = await leerJson<AudioGuion>(path.join(dir, g.id, 'voz.json'));
      await renderizar(g, audio, dir);
    } catch (e) {
      log('render', `ERROR ${g.id}: ${(e as Error).message}`);
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('render.ts')) {
  pasoRender().catch((e) => { console.error(e); process.exit(1); });
}
