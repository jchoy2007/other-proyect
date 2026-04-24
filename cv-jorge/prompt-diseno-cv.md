# Prompt para Generar CV con Diseño Profesional

Copia y pega el prompt de abajo en [claude.ai](https://claude.ai) (o ChatGPT), y **adjunta los 4 archivos `.md`** de la carpeta `cv-jorge/` (`cv-base.md`, `cv-ventas.md`, `cv-seguros.md`, `cv-comercio-internacional.md`).

El resultado será **4 archivos HTML** con diseño profesional que puedes abrir en tu navegador y **guardar como PDF** (Ctrl+P → "Guardar como PDF").

---

## 📋 Prompt para copiar

```
Soy Jorge Augusto Choy Caballero, profesional panameño buscando empleo en Panamá. Te adjunto 4 CVs en formato Markdown:

1. cv-base.md — mi CV maestro
2. cv-ventas.md — adaptado para vacantes comerciales
3. cv-seguros.md — adaptado para seguros/call center
4. cv-comercio-internacional.md — adaptado para comercio exterior

Necesito que conviertas CADA UNO en un archivo HTML completo y autocontenido (HTML + CSS inline, sin dependencias externas) con diseño profesional de nivel corporativo, listo para imprimir como PDF en carta o A4.

REQUISITOS DE DISEÑO:

1. Layout de DOS COLUMNAS:
   - Columna izquierda (ancho ~35%): fondo azul oscuro (#1e3a5f o similar corporativo), texto claro. Contiene: foto, datos de contacto, habilidades, idiomas, referencias.
   - Columna derecha (ancho ~65%): fondo blanco. Contiene: nombre grande, perfil profesional, experiencia laboral, formación académica, logros.

2. Foto de perfil:
   - Incluir un placeholder circular de 140x140px arriba en la columna izquierda.
   - Usar <img src="foto.jpg" alt="Jorge Choy" /> para que yo solo reemplace el archivo "foto.jpg" en la misma carpeta.
   - Si la foto no carga, que se vea un círculo gris con las iniciales "JC" centradas.

3. Tipografía:
   - Títulos: "Montserrat" o sans-serif similar, bold.
   - Texto: "Open Sans" o sans-serif, 10-11pt.
   - Fallback a system fonts si las Google Fonts no cargan (usar @import con fallback).

4. Espaciado y legibilidad:
   - Márgenes generosos, respiración entre secciones.
   - Debe caber en 1 página carta/A4 máximo 2. Usa @media print para ajustes.
   - Iconos simples en Unicode (📍 📱 ✉️ 🔗) o SVG inline pequeños para contacto.

5. Detalles de impresión:
   - Colores que se vean bien impresos a color y en escala de grises.
   - @page { size: A4; margin: 0; } para que al imprimir no salgan márgenes blancos alrededor.
   - Agregar -webkit-print-color-adjust: exact; para que los fondos de color se impriman.

6. Acento visual:
   - Barras de color delgadas separando secciones.
   - Título de cada sección en mayúsculas, con letra en espaciado amplio (letter-spacing).
   - Nombre del candidato en tamaño grande (32-40pt).

7. Contenido:
   - Respeta EXACTAMENTE el texto que viene en cada Markdown (no inventes ni quites información).
   - Respeta los saltos de línea y bullets.
   - El teléfono es +507 6043-4542 y el correo jorgechoy@innovasolution.com — confirma que salgan bien visibles.

ENTREGABLE:

Entrégame 4 bloques de código, uno por cada archivo, claramente etiquetados:
- cv-base.html
- cv-ventas.html
- cv-seguros.html
- cv-comercio-internacional.html

Cada uno debe ser un HTML completo (<!DOCTYPE html>...</html>) listo para guardar y abrir en el navegador.

Al final, dame instrucciones breves de cómo imprimirlos a PDF desde Chrome.
```

---

## 📸 Cómo agregar tu foto

1. **Toma o elige una foto profesional** (fondo neutro, camisa/saco, mirando a cámara).
2. **Recórtala en forma cuadrada** (la app Fotos del teléfono sirve, o canva.com).
3. **Renómbrala a `foto.jpg`** exacto (minúsculas).
4. **Ponla en la misma carpeta** que los archivos `.html` que te entregue Claude.
5. Abre el HTML → se mostrará la foto automáticamente.

Si no tienes una foto profesional lista, sirve:
- Foto de tu cédula escaneada (si es reciente)
- Foto de LinkedIn actual
- O pídele a alguien que te tome una con el celular, fondo pared blanca, con buena luz natural

---

## 🖨️ Cómo convertir el HTML a PDF

### En Chrome/Edge:
1. Abrir el archivo `.html` → doble clic.
2. Presionar `Ctrl+P` (o `Cmd+P` en Mac).
3. En "Destino" elegir **"Guardar como PDF"**.
4. Márgenes: **Ninguno** o **Predeterminado**.
5. Marcar: **"Gráficos de fondo"** (importante para que salgan los colores).
6. Guardar como: `CV_Jorge_Choy_[Versión].pdf`

### Alternativa rápida:
Usa [printfriendly.com](https://www.printfriendly.com) — pegas el HTML y te da un PDF con un clic.

---

## 🎨 Si prefieres Canva en vez de HTML

Otro flujo más visual:

1. Entra a [canva.com](https://canva.com) → "Crear diseño" → "Currículum".
2. Elige plantilla de 2 columnas, estilo corporativo azul.
3. Pega el contenido de `cv-base.md` (o la versión que quieras) en los cuadros.
4. Sube tu foto a la plantilla.
5. Descargar → PDF estándar.

Tiempo: ~30 min por CV. Canva tiene plantillas gratis que quedan muy bien.

---

## ✅ Versiones finales esperadas

Al terminar este paso tendrás **4 PDFs profesionales**:

| Archivo | Úsalo para |
|---------|------------|
| `CV_Jorge_Choy_Base.pdf` | Konzerta, LinkedIn, postulación general |
| `CV_Jorge_Choy_Ventas.pdf` | Vacantes de ventas/comercial |
| `CV_Jorge_Choy_Seguros.pdf` | Vacantes en aseguradoras / call center |
| `CV_Jorge_Choy_Comercio.pdf` | Vacantes de comercio exterior / compras |

Súbelos a tu correo o Google Drive para tenerlos siempre a mano.
