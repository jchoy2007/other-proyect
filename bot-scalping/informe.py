"""Convierte resultados/resultados.json en resultados/informe.md y elige la configuración para la demo."""
from __future__ import annotations

import json
from pathlib import Path

RES = Path(__file__).resolve().parent / "resultados"
d = json.loads((RES / "resultados.json").read_text())
reglas = [f for f in d["reglas"] if not f.get("sin_resultado")]
ml = d["modelo"]

lin = ["# Resultados del entrenamiento", "",
       "Datos: velas de 1 minuto de Binance, del 23 de agosto al 19-20 de noviembre de 2026. Entrenamiento: primeros 60 días. Prueba: los días siguientes, que el optimizador nunca vio.",
       "Comisiones: spot 0,10% por lado; futuros 0,05% a mercado y 0,02% con orden límite; deslizamiento 0,01%. Apalancamiento 1x (los % se multiplican con apalancamiento, las pérdidas también).", "",
       "## Reglas: la mejor configuración del entrenamiento, evaluada en la prueba", "",
       "| Mercado | Par | Estrategia | Combinaciones rentables en entreno | Entreno | Prueba | Prueba sin comisiones | Ops prueba | Aciertos | Factor de beneficio |",
       "|---|---|---|---|---|---|---|---|---|---|"]
for f in sorted(reglas, key=lambda x: -x["prueba"]["retorno_total"]):
    e, p, b = f["entreno"], f["prueba"], f["prueba_sin_costos"]
    lin.append(f"| {f['mercado']} | {f['simbolo']} | {f['estrategia']} | {f['rentables_en_entreno']}/{f['combinaciones']} | {e['retorno_total']:+.1f}% | {p['retorno_total']:+.1f}% | {b['retorno_total']:+.1f}% | {p['operaciones']} | {p['aciertos']:.0f}% | {p['factor_beneficio']:.2f} |")
pos = [f for f in reglas if f["prueba"]["retorno_total"] > 0]
lin += ["", f"**Positivas en la prueba: {len(pos)} de {len(reglas)}.**", "",
        "## Modelo de aprendizaje automático (gradient boosting, futuros)", "",
        "| Par | Umbral | Validación | Prueba | Prueba sin comisiones | Ops prueba | Aciertos |", "|---|---|---|---|---|---|---|"]
for m in ml:
    if "prueba" not in m:
        lin.append(f"| {m['simbolo']} | - | {m.get('modelo')} | | | | |")
        continue
    v, p, b = m["validacion"], m["prueba"], m["prueba_sin_costos"]
    lin.append(f"| {m['simbolo']} | {m['umbral']} | {v['retorno_total']:+.1f}% | {p['retorno_total']:+.1f}% | {b['retorno_total']:+.1f}% | {p['operaciones']} | {p['aciertos']:.0f}% |")

# Configuración para la demo: la mejor de futuros en un par operable con 5 USD (DOGE o SOL), elegida por su resultado en ENTRENAMIENTO
candidatas = [f for f in reglas if f["mercado"] == "futuros" and f["simbolo"] in ("DOGEUSDT", "SOLUSDT")]
elegida = max(candidatas, key=lambda f: f["entreno"]["retorno_total"])
cfg = {k: elegida[k] for k in ("estrategia", "params", "tp", "sl", "max_barras", "simbolo", "mercado")}
cfg["resultado_prueba_pct"] = elegida["prueba"]["retorno_total"]
(RES / "config_demo.json").write_text(json.dumps(cfg, indent=2, ensure_ascii=False))
lin += ["", "## Configuración enviada a la demo", "", f"`{json.dumps(cfg, ensure_ascii=False)}`",
        "", "Elegida por su resultado en entrenamiento entre los pares que admiten 5 USD. Su resultado en la prueba indica qué esperar."]
(RES / "informe.md").write_text("\n".join(lin) + "\n")
print("\n".join(lin))
