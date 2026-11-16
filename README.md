# other-proyect

Monorepo con varios proyectos independientes. Cada carpeta tiene su propio README con instalación, uso y pendientes.

| Carpeta | Qué es | Estado |
|---|---|---|
| `whatsapp-bot-negocio/` | Landing + bot de WhatsApp con IA para negocios (Next.js + Express). | En producción (GitHub Pages). |
| `buscador-cupones/` | Le pasas un enlace de Amazon/Newegg/Best Buy/Walmart/eBay y busca códigos, cupones, ofertas, historial de precios y cashback en fuentes existentes. Web + API + CLI + bookmarklet. | Funciona; probado con enlaces reales. |
| `calibrador-mandos-ps/` | PWA que mide el drift de DualShock 4 / DualSense y recalibra centro y rango por WebHID (USB). | Escrito y cargado sin errores; **falta probar con un mando real**. |
| `fabrica-videos-gta6/` | Pipeline diario: tendencias → guiones con Claude → voz → montaje ffmpeg → YouTube/TikTok. | Tendencias, voz y montaje probados; **guiones y subida requieren credenciales** (no probados). |

## Traspaso para la siguiente sesión

Orden sugerido de trabajo (pensado para continuarlo con Claude Opus 5.5 u otro modelo):

1. **fabrica-videos-gta6**
   - Poner `ANTHROPIC_API_KEY` y ejecutar `npm run tendencias && npm run guiones`. Comprobar que el JSON cumple el esquema (`src/pasos/guiones.ts`) y afinar el prompt (`instrucciones()`).
   - Grabar o conseguir clips propios de GTA 6 y dejarlos en `media/gameplay/` con nombres descriptivos en inglés; sin ellos el montaje usa fondos planos.
   - Crear credenciales de YouTube (`npm run youtube:auth`) y probar `npm run publicar` con `YT_PRIVACIDAD=private`.
   - Pedir verificación de la app en Google y auditoría de Content Posting en TikTok (semanas); hasta entonces publicar en privado y hacer público a mano.
   - Leer la sección "Antes de ilusionarte" del README: política de contenido inauténtico de YouTube y política de video de Rockstar.
2. **calibrador-mandos-ps**: abrir `index.html` servido por HTTPS/localhost en Chrome, conectar un DualShock 4 o DualSense por USB y recorrer medir → centro → rango → guardar. Si el protocolo falla en un paso, comparar con `js/controllers/*` del proyecto dualshock-tools.
3. **buscador-cupones**: desplegar (Railway/Render o en casa). Posibles mejoras: más tiendas, Keepa con API key, notificaciones cuando baje el precio.

## Convenciones

- Español en interfaz, nombres de archivos, variables y commits.
- Cada proyecto se instala y corre por separado (`npm install` dentro de la carpeta).
- Secretos solo en `.env` (nunca en el repo); cada proyecto trae `.env.example`.
