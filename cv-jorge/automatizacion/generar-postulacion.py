"""
Generador automatizado de postulaciones personalizadas.

Uso:
    python generar-postulacion.py           # modo interactivo (pegas la vacante)
    python generar-postulacion.py vacante.txt   # lee la vacante desde archivo

Requiere:
    pip install anthropic
    export ANTHROPIC_API_KEY="tu-api-key"

Genera en la carpeta ./salidas/:
    - cv-adaptado.md        CV con keywords de la vacante
    - carta-presentacion.md Carta personalizada
    - mensaje-linkedin.txt  Mensaje para el reclutador
    - analisis-match.md     Puntaje de compatibilidad + consejos
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: instala primero: pip install anthropic")
    sys.exit(1)

MODEL = "claude-sonnet-4-6"
BASE_DIR = Path(__file__).resolve().parent.parent
CV_BASE_PATH = BASE_DIR / "cv-base.md"
SALIDAS_DIR = Path(__file__).resolve().parent / "salidas"


def cargar_cv_base() -> str:
    if not CV_BASE_PATH.exists():
        print(f"ERROR: no se encontró {CV_BASE_PATH}")
        sys.exit(1)
    return CV_BASE_PATH.read_text(encoding="utf-8")


def obtener_vacante() -> str:
    if len(sys.argv) > 1:
        ruta = Path(sys.argv[1])
        if not ruta.exists():
            print(f"ERROR: archivo no encontrado: {ruta}")
            sys.exit(1)
        return ruta.read_text(encoding="utf-8")

    print("\nPega la descripción completa de la vacante.")
    print("Cuando termines, escribe una línea con solo: FIN\n")
    lineas = []
    while True:
        linea = input()
        if linea.strip().upper() == "FIN":
            break
        lineas.append(linea)
    return "\n".join(lineas)


SYSTEM_PROMPT = """Eres un experto en reclutamiento y marketing personal en Panamá con 15 años de experiencia ayudando a candidatos a postularse en LinkedIn y Konzerta.

Tu tarea es analizar una vacante y adaptar los materiales de postulación de Jorge Augusto Choy Caballero para maximizar sus probabilidades de obtener la entrevista.

Reglas:
1. Usa las palabras exactas de la descripción de la vacante (los reclutadores las buscan).
2. No inventes experiencias ni certificaciones que Jorge no tiene.
3. Destaca los logros reales de Jorge que más se alinean con lo pedido.
4. Sé honesto en el puntaje de match; si no encaja, dilo.
5. Responde siempre en español de Panamá, profesional pero natural.
6. Devuelve SIEMPRE un objeto JSON con la estructura pedida, sin texto adicional."""


def construir_mensajes(cv_base: str, vacante: str) -> list:
    # El CV base se marca para caché (se reutiliza entre corridas).
    return [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Este es el CV base de Jorge Augusto Choy Caballero. "
                        "Úsalo como fuente única de verdad sobre su experiencia:\n\n"
                        "---CV BASE---\n"
                        f"{cv_base}\n"
                        "---FIN CV BASE---"
                    ),
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": (
                        "Vacante a la que Jorge quiere postularse:\n\n"
                        "---VACANTE---\n"
                        f"{vacante}\n"
                        "---FIN VACANTE---\n\n"
                        "Genera un JSON con exactamente estas llaves:\n"
                        "{\n"
                        '  "empresa": "nombre de la empresa",\n'
                        '  "puesto": "nombre exacto del puesto",\n'
                        '  "match_score": 0-100,\n'
                        '  "match_explicacion": "por qué ese puntaje, 3-4 líneas",\n'
                        '  "debe_postular": true/false,\n'
                        '  "palabras_clave_vacante": ["lista", "de", "keywords", "detectadas"],\n'
                        '  "cv_adaptado_md": "CV en Markdown con énfasis en lo relevante para esta vacante",\n'
                        '  "carta_presentacion_md": "Carta completa en Markdown, 3-4 párrafos, lista para enviar",\n'
                        '  "mensaje_linkedin_reclutador": "Mensaje corto (máx 300 caracteres) para enviar al reclutador en LinkedIn",\n'
                        '  "consejos_personalizados": ["máx 5 tips específicos para ESTA postulación"],\n'
                        '  "preguntas_probables_entrevista": ["5 preguntas que probablemente te harán"]\n'
                        "}\n\n"
                        "RESPONDE SOLO EL JSON, SIN NINGÚN TEXTO ANTES O DESPUÉS."
                    ),
                },
            ],
        }
    ]


def generar(vacante: str) -> dict:
    cv_base = cargar_cv_base()
    client = anthropic.Anthropic()

    print(f"\nAnalizando vacante con {MODEL}...")
    respuesta = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=construir_mensajes(cv_base, vacante),
    )

    uso = respuesta.usage
    cache_read = getattr(uso, "cache_read_input_tokens", 0) or 0
    cache_creation = getattr(uso, "cache_creation_input_tokens", 0) or 0
    print(
        f"Tokens: entrada={uso.input_tokens} "
        f"(caché leído={cache_read}, caché creado={cache_creation}) "
        f"salida={uso.output_tokens}"
    )

    texto = "".join(bloque.text for bloque in respuesta.content if bloque.type == "text")
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        print("\nERROR: la respuesta no es JSON válido. Respuesta cruda:\n")
        print(texto)
        sys.exit(1)


def guardar(resultado: dict) -> Path:
    SALIDAS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    empresa_slug = (
        resultado.get("empresa", "empresa")
        .lower()
        .replace(" ", "-")
        .replace("/", "-")[:40]
    )
    carpeta = SALIDAS_DIR / f"{timestamp}_{empresa_slug}"
    carpeta.mkdir(exist_ok=True)

    (carpeta / "cv-adaptado.md").write_text(
        resultado.get("cv_adaptado_md", ""), encoding="utf-8"
    )
    (carpeta / "carta-presentacion.md").write_text(
        resultado.get("carta_presentacion_md", ""), encoding="utf-8"
    )
    (carpeta / "mensaje-linkedin.txt").write_text(
        resultado.get("mensaje_linkedin_reclutador", ""), encoding="utf-8"
    )

    analisis = [
        f"# Análisis de match — {resultado.get('empresa', '')}",
        "",
        f"- **Puesto:** {resultado.get('puesto', '')}",
        f"- **Match score:** {resultado.get('match_score', 0)}/100",
        f"- **¿Postular?:** {'SÍ' if resultado.get('debe_postular') else 'NO'}",
        "",
        "## Razón del puntaje",
        resultado.get("match_explicacion", ""),
        "",
        "## Palabras clave detectadas en la vacante",
    ]
    for kw in resultado.get("palabras_clave_vacante", []):
        analisis.append(f"- {kw}")
    analisis += ["", "## Consejos personalizados para esta postulación"]
    for c in resultado.get("consejos_personalizados", []):
        analisis.append(f"- {c}")
    analisis += ["", "## Preguntas probables en entrevista"]
    for p in resultado.get("preguntas_probables_entrevista", []):
        analisis.append(f"- {p}")

    (carpeta / "analisis-match.md").write_text("\n".join(analisis), encoding="utf-8")
    (carpeta / "respuesta-cruda.json").write_text(
        json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return carpeta


def main() -> None:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: define la variable de entorno ANTHROPIC_API_KEY.")
        print("  export ANTHROPIC_API_KEY='tu-api-key'")
        sys.exit(1)

    vacante = obtener_vacante()
    if not vacante.strip():
        print("ERROR: no se proporcionó descripción de la vacante.")
        sys.exit(1)

    resultado = generar(vacante)
    carpeta = guardar(resultado)

    print("\n" + "=" * 60)
    print(f"Match: {resultado.get('match_score', 0)}/100 — "
          f"{'POSTULAR' if resultado.get('debe_postular') else 'MEJOR NO'}")
    print(f"Empresa: {resultado.get('empresa', '')}")
    print(f"Puesto: {resultado.get('puesto', '')}")
    print("=" * 60)
    print(f"\nArchivos generados en: {carpeta}")
    print("  - cv-adaptado.md")
    print("  - carta-presentacion.md")
    print("  - mensaje-linkedin.txt")
    print("  - analisis-match.md")


if __name__ == "__main__":
    main()
