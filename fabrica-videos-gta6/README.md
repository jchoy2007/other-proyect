# Fábrica de videos (GTA 6 → YouTube + TikTok)

Pipeline que cada día, solo:

1. **Tendencias**: lee qué está buscando la gente sobre el tema ahora mismo (autocompletado de YouTube y Google en 5 países + Google Trends).
2. **Guiones**: Claude (`claude-opus-5-5`) convierte esas búsquedas en 3-5 guiones con gancho, escenas, texto en pantalla, hashtags y descripción. Verifica los datos con búsqueda web antes de escribir y devuelve las fuentes.
3. **Voz**: voz en off con voces neuronales gratuitas de Microsoft (`edge-tts`), español latino o de España.
4. **Montaje**: `ffmpeg` arma el video por escenas con tus clips de gameplay o imágenes (de `media/`), texto grande en pantalla, gancho inicial, voz y música de fondo. Shorts en 9:16 y videos largos en 16:9.
5. **Publicación**: sube a YouTube (programado a horas fijas, declarado como contenido con voz sintética) y a TikTok.

Cada paso deja su resultado en `salida/AAAA-MM-DD/` y se puede relanzar sin repetir lo ya hecho.

## Antes de ilusionarte: lo que decide si esto da dinero

| Tema | Realidad |
|---|---|
| **Footage** | El pipeline no puede jugar GTA 6 (sale el 19 de noviembre de 2026 solo en PS5/Xbox). Los clips de gameplay los tienes que grabar tú (o capturar de la consola) y dejarlos en `media/gameplay/`. Sin clips, el montaje usa fondos generados: sirve para probar, no para publicar. |
| **Rockstar** | Su política permite subir gameplay y monetizarlo en YouTube, pero prohíbe filtraciones, spoilers de historia/finales y "compilaciones de cinemáticas". El guionista ya tiene esas reglas; aun así revísalo. |
| **YouTube** | Desde julio de 2025 la política de "contenido inauténtico" desmonetiza canales de videos repetitivos y producidos en masa. 3-5 videos al día con voz sintética e idéntico formato es exactamente lo que vigilan. Mitigación: varía el formato, pon tu voz o cara en parte del contenido, edita los guiones. Monetizar exige además 1.000 suscriptores y 4.000 h vistas (o 10 M de vistas de Shorts en 90 días). Los Shorts pagan muy poco por vista; el dinero está en los videos largos. |
| **YouTube API** | Las apps nuevas sin verificar solo pueden subir en **privado** hasta pasar la revisión de Google (varias semanas). Por eso `YT_PRIVACIDAD=private` por defecto: los videos llegan al canal y los publicas tú con un clic hasta tener la app aprobada. |
| **TikTok API** | Igual: una app sin auditar solo publica en privado y para 5 usuarios. Pasar la auditoría tarda semanas. Alternativa práctica mientras tanto: el pipeline deja los Shorts listos en `salida/` y los subes desde el móvil. |
| **Cuánto cuesta** | Claude: unos 0,10-0,40 USD por día (3 guiones con búsqueda web). Voz: gratis. YouTube/TikTok: gratis. Ejecutarlo en GitHub Actions: gratis en repos públicos / 2.000 min al mes en privados. |

Si aceptas eso, el valor real del sistema es **velocidad**: el día del estreno y las semanas siguientes, tener listos 3-5 videos al día sobre lo que la gente busca esa misma mañana.

## Instalación

```bash
cd fabrica-videos-gta6
npm install
python3 -m venv .venv-tts && .venv-tts/bin/pip install edge-tts
cp .env.example .env     # pon ANTHROPIC_API_KEY como mínimo
```

Necesitas `ffmpeg` y `ffprobe` en el PATH (`sudo apt install ffmpeg` / `brew install ffmpeg`).

Deja tus clips en `media/gameplay/` con nombres descriptivos en inglés, porque el montaje elige el clip por las palabras del nombre: `vice-city-night-drive.mp4`, `beach-trailer-lucia.mp4`, `car-chase-police.mp4`. Lo mismo para `media/imagenes/` (jpg/png) y música sin copyright en `media/musica/`.

## Uso

```bash
npm run pipeline                      # día completo
npm run pipeline -- --sin-publicar    # produce, no sube
npm run pipeline -- --desde=render    # repite desde un paso (tendencias|guiones|voz|render|publicar)
npm run tendencias                    # solo ver qué busca la gente hoy
```

Resultado en `salida/AAAA-MM-DD/`:

```
tendencias.json           lo que la gente busca, con peso por fuente y país
guiones.json              los guiones (edítalos a mano y relanza desde voz si quieres)
<id-video>/voz.mp3        voz completa
<id-video>/<id>.mp4       video final
publicacion.json          ids de YouTube/TikTok y errores
```

### YouTube

1. Google Cloud Console → proyecto → activar **YouTube Data API v3** → credenciales OAuth "Aplicación de escritorio".
2. `YT_CLIENT_ID` y `YT_CLIENT_SECRET` en `.env`, luego `npm run youtube:auth`, autoriza con la cuenta del canal y pega el `YT_REFRESH_TOKEN`.
3. Con `YT_PRIVACIDAD=public` los videos se programan a las horas de `YT_HORAS` (zona `TZ_PUBLICACION`). Hasta que Google verifique la app, déjalo en `private`.

### TikTok

1. developers.tiktok.com → app → producto **Content Posting API** → scope `video.publish`.
2. Consigue un access token para tu cuenta y ponlo en `TIKTOK_ACCESS_TOKEN`. Solo se suben los shorts.
3. Pide la auditoría de Content Posting para poder publicar en público.

### Automatizar

- **GitHub Actions**: ya hay un workflow en `.github/workflows/fabrica-videos.yml` que corre a diario a las 07:17 (CDMX). Añade los secretos `ANTHROPIC_API_KEY`, `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`, `TIKTOK_ACCESS_TOKEN`. Los clips de `media/` no caben en el repo: súbelos a un release o bucket y pon la URL del `.tar.gz` en la variable `MEDIA_URL`.
- **Tu PC / VPS**: `crontab -e` → `17 7 * * * cd /ruta/fabrica-videos-gta6 && npm run pipeline >> cron.log 2>&1`.

## Cambiar de tema

Todo gira sobre `TEMA`: pon `TEMA=Fortnite` o `TEMA=iPhone 18` y el resto del pipeline se adapta (tendencias, guiones, hashtags).

## Estado y pendientes

- ✅ Tendencias, voz y montaje probados en este entorno (sin clips reales).
- ⚠️ Guiones: código escrito según el SDK actual pero **no ejecutado** (no había clave de API en este entorno). Primer `npm run guiones` real: revisar que el JSON cumple el esquema y ajustar el prompt al gusto.
- ⚠️ Subida a YouTube/TikTok: escrita contra la API oficial, sin probar (requiere credenciales).
- Ideas siguientes: subtítulos palabra a palabra (edge-tts puede exportar SRT), miniaturas automáticas con Claude + ffmpeg, un paso de "revisión humana" por Telegram/WhatsApp antes de publicar, estadísticas de YouTube Analytics para que el guionista aprenda qué funcionó.
