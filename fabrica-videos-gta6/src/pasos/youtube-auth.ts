import http from 'node:http';
import { google } from 'googleapis';
import { config } from '../config.js';

/**
 * Obtiene el refresh token de YouTube una sola vez.
 * 1) En Google Cloud Console crea un proyecto, activa "YouTube Data API v3", crea credenciales OAuth
 *    de tipo "Aplicación de escritorio" y pon YT_CLIENT_ID / YT_CLIENT_SECRET en .env.
 * 2) npm run youtube:auth → abre el enlace, autoriza con la cuenta del canal y copia el token a .env.
 */
const PUERTO = 8976;
const oauth = new google.auth.OAuth2(config.youtube.clientId, config.youtube.clientSecret, `http://localhost:${PUERTO}/callback`);
const url = oauth.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'] });
console.log(`\nAbre este enlace en el navegador y autoriza el canal:\n\n${url}\n`);

http.createServer(async (req, res) => {
  const code = new URL(req.url || '/', `http://localhost:${PUERTO}`).searchParams.get('code');
  if (!code) { res.end('Falta code'); return; }
  const { tokens } = await oauth.getToken(code);
  res.end('Listo. Vuelve a la terminal.');
  console.log(`\nAñade esto a .env:\nYT_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  process.exit(0);
}).listen(PUERTO);
