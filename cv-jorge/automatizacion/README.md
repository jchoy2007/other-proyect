# Sistema Semi-Automatizado de Postulación

## Qué hace

Tomas la descripción de una vacante (la copias de LinkedIn, Konzerta, Bumeran, etc.), se la das al script, y en 15 segundos obtienes **4 archivos listos para usar**:

1. **`cv-adaptado.md`** — Tu CV con las palabras clave y énfasis correctos para ESA vacante.
2. **`carta-presentacion.md`** — Carta personalizada a la empresa y puesto.
3. **`mensaje-linkedin.txt`** — Mensaje corto para enviarle al reclutador.
4. **`analisis-match.md`** — Puntaje 0-100 de qué tan compatible es la vacante contigo, con razones.

## Qué NO hace (y por qué)

- **NO se loguea en tu cuenta** de LinkedIn/Konzerta.
- **NO envía la postulación por ti.**
- **NO hace spam** de mensajes a reclutadores.

¿Por qué? Porque eso viola los Términos de Servicio de esas plataformas y te puede costar el banneo permanente de tu cuenta. Además, las postulaciones automatizadas sin revisión humana se detectan y se descartan antes de llegar a un reclutador real.

**La magia de este sistema no es automatizar el clic, es automatizar la personalización**, que es donde el 95% de candidatos falla.

---

## Instalación (una sola vez)

### 1. Instalar Python 3.10 o superior

```bash
python3 --version
```

Si no tienes Python, descargalo de [python.org](https://www.python.org/downloads/).

### 2. Instalar la librería

```bash
pip install anthropic
```

### 3. Obtener tu API key de Anthropic

1. Ir a https://console.anthropic.com
2. Crear cuenta (gratis — no requiere tarjeta de crédito).
3. Hacer click en "Get API Keys" → "Create Key".
4. Copiar la clave (empieza con `sk-ant-...`).
5. Cargar **$5 o $10 USD** en "Billing" (es lo único que cuesta — y te alcanza para **200+ postulaciones**).

### 4. Configurar la clave como variable de entorno

**Linux/Mac:**
```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-tu-clave-aqui"' >> ~/.bashrc
source ~/.bashrc
```

**Windows (PowerShell):**
```powershell
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY","sk-ant-tu-clave-aqui","User")
```

Luego cierra y reabre la terminal.

---

## Cómo usarlo (cada vez que postulas)

### Modo interactivo (más fácil)

```bash
cd cv-jorge/automatizacion
python3 generar-postulacion.py
```

Te va a pedir que pegues la descripción de la vacante. Cuando termines, escribes `FIN` en una línea sola y presionas Enter.

### Modo archivo

Si prefieres guardar la vacante en un archivo:

```bash
# guarda el texto de la vacante en un archivo
nano vacante.txt
# luego
python3 generar-postulacion.py vacante.txt
```

### Resultado

El script crea una carpeta en `automatizacion/salidas/` con fecha y empresa, con los 4 archivos listos.

Ejemplo:
```
salidas/
└── 20260424-143022_concentrix/
    ├── cv-adaptado.md
    ├── carta-presentacion.md
    ├── mensaje-linkedin.txt
    ├── analisis-match.md
    └── respuesta-cruda.json
```

---

## Costo real por postulación

- Cada corrida usa **~3,000 tokens de entrada + ~3,000 de salida**.
- Costo estimado: **~$0.03 USD por postulación** (con Claude Sonnet 4.6).
- Con $5 USD haces unas **150 postulaciones personalizadas**.
- Con **prompt caching activado** (ya está en el script), a partir de la 2da postulación del día baja a ~$0.015.

---

## Flujo diario recomendado (30-45 min/día)

1. **Mañana (15 min):** Revisar alertas de Konzerta + LinkedIn. Apuntar 5 vacantes que te interesen.
2. **Día (20 min):** Para cada vacante:
   - Copiar la descripción completa.
   - Correr `python3 generar-postulacion.py`.
   - Leer el `analisis-match.md` — si el score es < 60, NO postular.
   - Si el score es ≥ 60: convertir `cv-adaptado.md` a PDF (con Pandoc o pegando en Word/Canva).
   - Postular en la plataforma pegando la `carta-presentacion.md`.
3. **Noche (5 min):** Actualizar el `tracker-postulaciones.md`.

---

## Convertir el CV de Markdown a PDF

### Opción 1: Pandoc (recomendada)

```bash
# Instalar una sola vez
sudo apt install pandoc texlive-xetex     # Linux
brew install pandoc                         # Mac

# Convertir
pandoc cv-adaptado.md -o CV_Jorge_Choy_[Empresa].pdf
```

### Opción 2: Pegar en Canva (más bonito)

1. Abrir [Canva.com](https://canva.com) → plantilla de CV.
2. Pegar el contenido adaptado.
3. Descargar como PDF.

### Opción 3: Word / Google Docs

1. Pegar el Markdown en un documento.
2. Aplicar formato de títulos (Heading 1, Heading 2).
3. Exportar como PDF.

---

## Problemas comunes

| Problema | Solución |
|----------|----------|
| `ANTHROPIC_API_KEY not found` | No configuraste la variable de entorno. Ver paso 4. |
| `No module named 'anthropic'` | Ejecutar `pip install anthropic`. |
| El script da error de JSON | Correr de nuevo — a veces el modelo devuelve formato ligeramente distinto. |
| El score siempre da bajo | La vacante realmente no encaja. No insistas — busca otra. |
| El CV adaptado miente sobre ti | Reportar el caso; el system prompt tiene instrucción explícita de no inventar. |

---

## Preguntas que quizá tengas

**¿Es ético usar IA para postularme?**
Sí, siempre que la información sobre ti sea verdadera. Lo que el script hace es reordenar y destacar tu experiencia real — exactamente lo que un coach de carrera te cobraría $200/hora por hacer.

**¿Los reclutadores van a detectar que usé IA?**
Si revisas el CV y la carta antes de enviar (que SIEMPRE debes hacer), no. Lo que detectan es copia-pega idéntica entre 100 postulaciones — este sistema hace exactamente lo contrario: **cada postulación es única**.

**¿Puedo modificar el system prompt?**
Sí. Está en `generar-postulacion.py` como `SYSTEM_PROMPT`. Puedes agregar instrucciones como "no menciones la carrera hasta el segundo párrafo" si te parece.
