import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  raiz,
  dirSalida: path.join(raiz, 'salida'),
  dirMedia: path.join(raiz, 'media'),
  /** Tema del canal. Se puede cambiar por otro juego o nicho sin tocar el código. */
  tema: process.env.TEMA || 'GTA 6',
  idioma: process.env.IDIOMA || 'es',
  /** Mercados para tendencias (códigos de Google Trends / gl) */
  paises: (process.env.PAISES || 'MX,US,ES,AR,CO').split(',').map((s) => s.trim()),
  videosPorDia: parseInt(process.env.VIDEOS_POR_DIA || '3', 10),
  /** Formatos a producir cada día: short (9:16, ≤60 s) y/o largo (16:9, 6-10 min) */
  formatos: (process.env.FORMATOS || 'short,short,largo').split(',').map((s) => s.trim()) as Array<'short' | 'largo'>,
  modelo: process.env.CLAUDE_MODEL || 'claude-opus-5-5',
  voz: process.env.VOZ || 'es-MX-JorgeNeural',
  vozVelocidad: process.env.VOZ_VELOCIDAD || '+8%',
  /** Python con edge-tts instalado (ver README) */
  pythonTts: process.env.PYTHON_TTS || path.join(raiz, '.venv-tts', 'bin', 'python3'),
  youtube: {
    clientId: process.env.YT_CLIENT_ID || '',
    clientSecret: process.env.YT_CLIENT_SECRET || '',
    refreshToken: process.env.YT_REFRESH_TOKEN || '',
    /** Horas (en la zona TZ_PUBLICACION) a las que programar los videos del día */
    horas: (process.env.YT_HORAS || '12:00,17:00,21:00').split(',').map((s) => s.trim()),
    privacidad: (process.env.YT_PRIVACIDAD || 'private') as 'private' | 'unlisted' | 'public',
    categoria: process.env.YT_CATEGORIA || '20', // 20 = Gaming
  },
  tiktok: {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN || '',
    privacidad: process.env.TIKTOK_PRIVACIDAD || 'SELF_ONLY', // Apps sin auditar solo pueden publicar en privado
  },
  zonaHoraria: process.env.TZ_PUBLICACION || 'America/Mexico_City',
};

export function dirDia(fecha = new Date()): string {
  const f = fecha.toISOString().slice(0, 10);
  return path.join(config.dirSalida, f);
}
