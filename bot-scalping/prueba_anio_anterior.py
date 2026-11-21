"""Prueba final de las mejores estrategias de la búsqueda masiva en el AÑO ANTERIOR (nov 2024 - nov 2025),
datos que la búsqueda nunca vio. Si la ventaja fuera real, debería aparecer también ahí."""
from __future__ import annotations

import json
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

import busqueda_masiva as b
from datos import _descargar_dia

RES = Path(__file__).resolve().parent / "resultados"
FIN_ANTERIOR = b.HASTA - timedelta(days=365)
mejores = json.loads((RES / "analisis_ganadoras.json").read_text())

def anio(simbolo):
    dias = [FIN_ANTERIOR - timedelta(days=i) for i in range(364, -1, -1)]
    with ThreadPoolExecutor(16) as ex:
        partes = list(ex.map(lambda d: _descargar_dia(simbolo, d, "futuros"), dias))
    df = pd.concat([p for p in partes if p is not None], ignore_index=True)
    return df.drop_duplicates("tiempo").sort_values("tiempo").set_index("tiempo")

cache = {}
print(f"Año anterior: {FIN_ANTERIOR - timedelta(days=364)} a {FIN_ANTERIOR}")
filas = []
for s in mejores:
    k = (s["simbolo"], s["marco"])
    if k not in cache:
        df = b.reagrupar(anio(s["simbolo"]), s["marco"])
        N = len(df)
        # Los umbrales por cuantiles se recalculan con el primer 60% de este año, igual que en la búsqueda
        nombres, M, atrp = b.banco_condiciones(df, int(N * 0.6))
        c = df["close"].to_numpy()
        cache[k] = (df, N, nombres, M, atrp)
        print(f"   {s['simbolo']} {s['marco']}: el precio pasó de {c[0]:.4g} a {c[-1]:.4g} ({100 * (c[-1] / c[0] - 1):+.0f}%)")
    df, N, nombres, M, atrp = cache[k]
    o, h, l, c = (df[x].to_numpy(dtype=np.float64) for x in ("open", "high", "low", "close"))
    entrada = np.ones(N, dtype=bool)
    for nom in s["condiciones"]:
        entrada &= M[nombres.index(nom)]
    d = 1 if s["direccion"] == "compra" else -1
    n, g, slog, pos, neg, dd, rets = b.simular_nb(o, h, l, c, atrp, entrada, 0, N, d, s["tp_atr"], s["sl_atr"], s["max_barras"], True, *b.costos("cripto", ""))
    r = b.resumen(n, g, slog, pos, neg, dd)
    filas.append({**{k2: s[k2] for k2 in ("simbolo", "marco", "direccion", "condiciones", "prueba_pct")}, "anio_anterior": r})
    print(f"{s['simbolo']:8} {s['marco']:4} {s['direccion']:6} {'+'.join(s['condiciones'])[:24]:24} prueba (2026) {s['prueba_pct']:+6.1f}%  →  año anterior {r['retorno']:+7.1f}% ({r['ops']} ops, caída máx {r['caida_max']}%)")
(RES / "prueba_anio_anterior.json").write_text(json.dumps(filas, indent=1, ensure_ascii=False))
