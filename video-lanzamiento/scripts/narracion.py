"""
Genera la narración (voz) y la línea de tiempo del video.

  python3 scripts/narracion.py

Salida:
  public/audio/voz/*.wav     una pista por frase
  src/linea-tiempo.json      duración de cada escena y momento de cada frase

La voz es Piper (es_MX-claude-high), un motor de texto a voz sin conexión.
El modelo se descarga en voces/ (no se sube al repositorio):
  https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX/claude/high
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MODELO = RAIZ / "voces" / "es_MX-claude-high.onnx"
SALIDA = RAIZ / "public" / "audio" / "voz"
FPS = 30
FADE = 12  # solapamiento entre escenas (igual que en src/ui.tsx)

# Sin narrador (por defecto): los tiempos se calculan por velocidad de lectura
# de los textos y el video lleva solo música. Con --con-voz se genera la voz.
CON_VOZ = "--con-voz" in sys.argv
LECTURA = 17  # caracteres por segundo

# Pronunciación fonética de los nombres en inglés
FON = {
    "Holding Realty Properties": "Jóldin Rílti Própertis",
    "Corporate Holding Solutions": "Córporeit Jóldin Solúshons",
    "holdingrealty punto com": "jóldin rílti, punto com",
    "BICSA": "Bícsa",
}

# (id de escena, duración visual mínima en fotogramas, frases)
# Cada frase: (texto, pausa antes en fotogramas)
GUION = [
    ("Familia", 150, [("Una familia en Panamá… por fin encontró su apartamento.", 24)]),
    ("Tramite", 100, [("Y entonces, empezó el trámite.", 10)]),
    ("Puertas", 240, [
        ("Promotora, corredor, banco, afianzadora, abogado.", 16),
        ("Cinco puertas… y el cliente es quien las camina.", 10),
        ("Un papel vencido, una carta incompleta… y la venta se cae.", 14),
    ]),
    ("Llave", 85, [("Cinco puertas. Una sola llave.", 8)]),
    ("Equipo", 220, [
        ("Detrás de nosotros, un equipo de liderazgo con más de veinticinco años de experiencia en el sector bancario, financiero e inmobiliario.", 14),
        ("Cuando decimos que entendemos al banco, no es un eslogan. Es nuestra historia.", 14),
    ]),
    ("Nace", 110, [("Por eso nació Holding Realty Properties.", 22)]),
    ("DosEmpresas", 160, [
        ("Vendemos el inmueble.", 8),
        ("Y con Corporate Holding Solutions, lo llevamos hasta el desembolso.", 8),
    ]),
    ("Recorrido", 150, [("Un solo acompañante, de la búsqueda… a las llaves.", 14)]),
    ("Casa", 140, [("Desde la Torre BICSA, frente a la bahía de Panamá.", 14)]),
    ("PaginaWeb", 170, [("Conoce todos nuestros servicios en holdingrealty punto com.", 18)]),
    ("Cierre", 300, [("Holding Realty Properties. Construyendo juntos un futuro de oportunidades.", 34)]),
]
COLA = 16  # fotogramas de aire después de la última frase de cada escena
COLA_CIERRE = 110  # tiempo para leer el contacto después de la última frase


def fonetico(t: str) -> str:
    for a, b in FON.items():
        t = t.replace(a, b)
    return t.replace("…", ",")


def sintetizar(texto: str, destino: Path) -> float:
    subprocess.run(
        ["python3", "-m", "piper", "-m", str(MODELO), "-f", str(destino),
         "--length-scale", "1.0", "--sentence-silence", "0.22"],
        input=fonetico(texto).encode(), check=True, capture_output=True,
    )
    # Recortar silencio final y normalizar con ffmpeg
    tmp = destino.with_suffix(".tmp.wav")
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(destino), "-af",
         "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
         "highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
         "loudnorm=I=-16:TP=-1.5:LRA=7",
         "-ar", "48000", "-ac", "1", str(tmp)], check=True)
    tmp.replace(destino)
    with wave.open(str(destino)) as w:
        return w.getnframes() / w.getframerate()


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    escenas, inicio_global = [], 0
    for i, (sid, base, frases) in enumerate(GUION):
        t, voces = 0, []
        for j, (texto, pausa) in enumerate(frases):
            archivo = f"{i + 1:02d}-{sid}-{j + 1}.wav"
            seg = sintetizar(texto, SALIDA / archivo) if CON_VOZ else min(4.6, max(1.2, len(texto) / LECTURA))
            t += pausa
            dur = int(round(seg * FPS))
            voces.append({"archivo": f"audio/voz/{archivo}", "inicio": t, "duracion": dur, "texto": texto})
            t += dur
        cola = COLA_CIERRE if sid == "Cierre" else COLA
        d = max(base, t + cola + FADE)
        escenas.append({"id": sid, "d": d, "desde": inicio_global, "voces": voces})
        inicio_global += d - FADE
    total = inicio_global + FADE
    (RAIZ / "src" / "linea-tiempo.json").write_text(
        json.dumps({"fps": FPS, "total": total, "conVoz": CON_VOZ, "escenas": escenas}, ensure_ascii=False, indent=2))
    for e in escenas:
        print(f"{e['id']:<12} {e['desde'] / FPS:5.1f}s  dura {e['d'] / FPS:4.1f}s  voces {[v['duracion'] for v in e['voces']]}")
    print(f"TOTAL {total / FPS:.1f} s")


if __name__ == "__main__":
    main()
