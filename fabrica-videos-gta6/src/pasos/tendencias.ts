import path from 'node:path';
import { config, dirDia } from '../config.js';
import type { Tendencia } from '../tipos.js';
import { escribirJson, log } from '../lib/util.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function get(url: string): Promise<string> {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': `${config.idioma},en;q=0.8` }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.text();
}

/** Autocompletado de YouTube: lo que la gente escribe ahora mismo en el buscador de YouTube */
async function sugerenciasYoutube(semilla: string, pais: string): Promise<Tendencia[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${config.idioma}&gl=${pais.toLowerCase()}&q=${encodeURIComponent(semilla)}`;
  const datos = JSON.parse(await get(url)) as [string, string[]];
  return datos[1].map((q, i) => ({ consulta: q, fuente: 'youtube-suggest', pais, puntuacion: 10 - i }));
}

/** Autocompletado de Google (búsqueda web) */
async function sugerenciasGoogle(semilla: string, pais: string): Promise<Tendencia[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${config.idioma}&gl=${pais.toLowerCase()}&q=${encodeURIComponent(semilla)}`;
  const datos = JSON.parse(await get(url)) as [string, string[]];
  return datos[1].map((q, i) => ({ consulta: q, fuente: 'google-suggest', pais, puntuacion: 8 - i * 0.8 }));
}

/** Google Trends diario: solo nos quedamos con lo que mencione el tema */
async function trendsDiario(pais: string): Promise<Tendencia[]> {
  const xml = await get(`https://trends.google.com/trending/rss?geo=${pais}`);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const re = new RegExp(config.tema.replace(/\s+/g, '\\s*'), 'i');
  const salida: Tendencia[] = [];
  for (const it of items) {
    const titulo = it.match(/<title>(?:<!\[CDATA\[)?([^<\]]+)/)?.[1]?.trim();
    const trafico = it.match(/<ht:approx_traffic>([^<]+)/)?.[1] ?? '';
    const noticias = [...it.matchAll(/<ht:news_item_title>(?:<!\[CDATA\[)?([^<\]]+)/g)].map((m) => m[1]);
    const texto = `${titulo} ${noticias.join(' ')}`;
    if (titulo && re.test(texto)) {
      const n = parseInt(trafico.replace(/[^\d]/g, ''), 10) || 0;
      salida.push({ consulta: titulo, fuente: 'google-trends', pais, puntuacion: 15 + Math.min(10, Math.log10(n + 1) * 2) });
    }
  }
  return salida;
}

export async function obtenerTendencias(): Promise<Tendencia[]> {
  const semillas = [config.tema, `${config.tema} ${config.idioma === 'es' ? 'noticias' : 'news'}`, `${config.tema} gameplay`, `${config.tema} ${config.idioma === 'es' ? 'misiones' : 'missions'}`, `${config.tema} trailer`, `${config.tema} ${config.idioma === 'es' ? 'secretos' : 'secrets'}`];
  const tareas: Promise<Tendencia[]>[] = [];
  for (const pais of config.paises) {
    tareas.push(trendsDiario(pais).catch((e) => { log('tendencias', `Google Trends ${pais}: ${e.message}`); return []; }));
    for (const s of semillas.slice(0, 4)) tareas.push(sugerenciasYoutube(s, pais).catch(() => []));
    tareas.push(sugerenciasGoogle(semillas[0], pais).catch(() => []));
  }
  const todas = (await Promise.all(tareas)).flat();
  // Agrupar consultas iguales sumando puntuación (si aparece en varios países pesa más)
  const mapa = new Map<string, Tendencia>();
  for (const t of todas) {
    const k = t.consulta.toLowerCase().trim();
    if (k === config.tema.toLowerCase()) continue;
    const prev = mapa.get(k);
    if (prev) { prev.puntuacion += t.puntuacion; prev.fuente = [...new Set([...prev.fuente.split('+'), t.fuente])].join('+'); }
    else mapa.set(k, { ...t });
  }
  return [...mapa.values()].sort((a, b) => b.puntuacion - a.puntuacion).slice(0, 40);
}

export async function pasoTendencias(dir = dirDia()): Promise<Tendencia[]> {
  const t = await obtenerTendencias();
  await escribirJson(path.join(dir, 'tendencias.json'), { generadoEn: new Date().toISOString(), tema: config.tema, tendencias: t });
  log('tendencias', `${t.length} consultas. Top 5: ${t.slice(0, 5).map((x) => x.consulta).join(' | ')}`);
  return t;
}

if (process.argv[1] && process.argv[1].endsWith('tendencias.ts')) {
  pasoTendencias().catch((e) => { console.error(e); process.exit(1); });
}
