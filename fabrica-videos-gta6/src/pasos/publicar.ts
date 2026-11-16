import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { config, dirDia } from '../config.js';
import type { Guion } from '../tipos.js';
import { escribirJson, existe, leerJson, log } from '../lib/util.js';

/** Fecha/hora de publicación programada para el video n del día, en la zona configurada */
function horaProgramada(n: number): Date {
  const hora = config.youtube.horas[n % config.youtube.horas.length] ?? '12:00';
  const [h, m] = hora.split(':').map(Number);
  const ahora = new Date();
  const local = new Date(ahora.toLocaleString('en-US', { timeZone: config.zonaHoraria }));
  const desfase = ahora.getTime() - local.getTime();
  const objetivo = new Date(local.getFullYear(), local.getMonth(), local.getDate(), h, m, 0);
  let utc = new Date(objetivo.getTime() + desfase);
  if (utc.getTime() < ahora.getTime() + 15 * 60_000) utc = new Date(utc.getTime() + 24 * 3600_000); // si ya pasó, mañana
  return utc;
}

export async function subirYoutube(guion: Guion, video: string, indice: number): Promise<string> {
  const { clientId, clientSecret, refreshToken } = config.youtube;
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Faltan YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN (ejecuta npm run youtube:auth).');
  const oauth = new google.auth.OAuth2(clientId, clientSecret);
  oauth.setCredentials({ refresh_token: refreshToken });
  const yt = google.youtube({ version: 'v3', auth: oauth });
  const esShort = guion.formato === 'short';
  const titulo = (esShort && !/#shorts/i.test(guion.titulo) ? `${guion.titulo} #Shorts` : guion.titulo).slice(0, 100);
  const descripcion = `${guion.descripcion}\n\n${guion.hashtags.join(' ')}\n\nFuentes:\n${guion.fuentes.join('\n')}`.slice(0, 4900);
  const programar = config.youtube.privacidad === 'public';
  const res = await yt.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title: titulo, description: descripcion, tags: guion.hashtags.map((h) => h.replace('#', '')).slice(0, 30), categoryId: config.youtube.categoria, defaultLanguage: config.idioma },
      status: {
        privacyStatus: programar ? 'private' : config.youtube.privacidad,
        publishAt: programar ? horaProgramada(indice).toISOString() : undefined,
        selfDeclaredMadeForKids: false,
        containsSyntheticMedia: true, // voz generada: YouTube exige declararlo
      },
    },
    media: { body: fs.createReadStream(video) },
  });
  const id = res.data.id!;
  log('youtube', `${guion.id} → https://youtu.be/${id}${programar ? ` (programado ${horaProgramada(indice).toISOString()})` : ` (${config.youtube.privacidad})`}`);
  return id;
}

/**
 * TikTok Content Posting API (Direct Post, subida por archivo).
 * Mientras la app no pase la auditoría de TikTok solo puede publicar como privado (SELF_ONLY) y para 5 usuarios.
 */
export async function subirTiktok(guion: Guion, video: string): Promise<string> {
  const token = config.tiktok.accessToken;
  if (!token) throw new Error('Falta TIKTOK_ACCESS_TOKEN.');
  const tam = fs.statSync(video).size;
  const init = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      post_info: { title: `${guion.titulo} ${guion.hashtags.join(' ')}`.slice(0, 2200), privacy_level: config.tiktok.privacidad, disable_duet: false, disable_comment: false, disable_stitch: false, video_cover_timestamp_ms: 1000 },
      source_info: { source: 'FILE_UPLOAD', video_size: tam, chunk_size: tam, total_chunk_count: 1 },
    }),
  });
  const datos = (await init.json()) as { data?: { publish_id: string; upload_url: string }; error?: { code: string; message: string } };
  if (!datos.data?.upload_url) throw new Error(`TikTok init: ${datos.error?.code} ${datos.error?.message}`);
  const subida = await fetch(datos.data.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Range': `bytes 0-${tam - 1}/${tam}`, 'Content-Length': String(tam) },
    body: fs.readFileSync(video),
  });
  if (!subida.ok) throw new Error(`TikTok upload HTTP ${subida.status}`);
  log('tiktok', `${guion.id} → publish_id ${datos.data.publish_id} (${config.tiktok.privacidad})`);
  return datos.data.publish_id;
}

export async function pasoPublicar(dir = dirDia()): Promise<void> {
  const guiones = await leerJson<Guion[]>(path.join(dir, 'guiones.json'));
  const registro: Record<string, { youtube?: string; tiktok?: string; errores: string[] }> = (await existe(path.join(dir, 'publicacion.json'))) ? await leerJson(path.join(dir, 'publicacion.json')) : {};
  for (let i = 0; i < guiones.length; i++) {
    const g = guiones[i];
    const video = path.join(dir, g.id, `${g.id}.mp4`);
    const r = (registro[g.id] ??= { errores: [] });
    if (!(await existe(video))) { r.errores.push('Sin video renderizado'); continue; }
    if (!r.youtube && config.youtube.refreshToken) {
      try { r.youtube = await subirYoutube(g, video, i); } catch (e) { r.errores.push(`YouTube: ${(e as Error).message}`); log('youtube', `ERROR ${g.id}: ${(e as Error).message}`); }
    }
    if (!r.tiktok && config.tiktok.accessToken && g.formato === 'short') {
      try { r.tiktok = await subirTiktok(g, video); } catch (e) { r.errores.push(`TikTok: ${(e as Error).message}`); log('tiktok', `ERROR ${g.id}: ${(e as Error).message}`); }
    }
    await escribirJson(path.join(dir, 'publicacion.json'), registro);
  }
  if (!config.youtube.refreshToken && !config.tiktok.accessToken) log('publicar', 'Sin credenciales de YouTube ni TikTok: los videos quedan en salida/ para subirlos a mano.');
}

if (process.argv[1] && process.argv[1].endsWith('publicar.ts')) {
  pasoPublicar().catch((e) => { console.error(e); process.exit(1); });
}
