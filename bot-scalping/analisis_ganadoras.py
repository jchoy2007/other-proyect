"""Revisa las mejores estrategias de la búsqueda masiva:
1) ¿El mercado subió o bajó en cada tramo? (si DOGE cayó todo el año, cualquier venta en corto gana)
2) Para cada estrategia: su resultado en la prueba frente a 1.000 versiones con entradas al azar y las mismas salidas.
3) Monte Carlo: probabilidad de llevar 10 o 20 USD a 1.000 USD con sus operaciones fuera de muestra, con apalancamiento."""
from __future__ import annotations

import json
import numpy as np
from pathlib import Path

import busqueda_masiva as b

RES = Path(__file__).resolve().parent / "resultados"
d = json.loads((RES / "busqueda_masiva.json").read_text())
top = []
vistos = set()
for s in d["sobrevivientes"]:
    clave = (s["simbolo"], s["marco"], s["direccion"], tuple(s["condiciones"]), s["tp_atr"], s["sl_atr"], s["max_barras"])
    if clave not in vistos:
        vistos.add(clave)
        top.append(s)
    if len(top) == 10:
        break

print("1) Movimiento del precio en cada tramo (búsqueda | validación | prueba)")
for sim in ("DOGEUSDT", "XRPUSDT", "SOLUSDT", "BTCUSDT", "ETHUSDT", "BNBUSDT"):
    df = b.reagrupar(b.cargar_anio(sim), "1h")
    N = len(df); f1, f2 = int(N * .6), int(N * .8)
    c = df["close"].to_numpy()
    tramos = [(0, f1), (f1, f2), (f2, N - 1)]
    print(f"   {sim:9} " + " | ".join(f"{100 * (c[j] / c[i] - 1):+6.1f}%" for i, j in tramos))

print("\n2) Cada estrategia frente a 1.000 copias con entradas al azar (misma frecuencia, mismas salidas), tramo de prueba")
rng = np.random.default_rng(0)
cache = {}
informe = []
for s in top:
    k = (s["simbolo"], s["marco"])
    if k not in cache:
        df = b.reagrupar(b.cargar_anio(s["simbolo"]), s["marco"])
        N = len(df); f1, f2 = int(N * .6), int(N * .8)
        nombres, M, atrp = b.banco_condiciones(df, f1)
        cache[k] = (df, N, f1, f2, nombres, M, atrp)
    df, N, f1, f2, nombres, M, atrp = cache[k]
    o, h, l, c = (df[x].to_numpy(dtype=np.float64) for x in ("open", "high", "low", "close"))
    entrada = np.ones(N, dtype=bool)
    for nom in s["condiciones"]:
        entrada &= M[nombres.index(nom)]
    dd = 1 if s["direccion"] == "compra" else -1
    real = b.simular_nb(o, h, l, c, atrp, entrada, f2, N, dd, s["tp_atr"], s["sl_atr"], s["max_barras"], True, *b.costos("cripto", ""))
    p = max(entrada[f2:].mean(), 1e-4)
    azar = []
    for _ in range(1000):
        e2 = rng.random(N) < p
        r = b.simular_nb(o, h, l, c, atrp, e2, f2, N, dd, s["tp_atr"], s["sl_atr"], s["max_barras"], False, *b.costos("cripto", ""))
        azar.append(np.exp(r[2]) - 1)
    azar = np.array(azar) * 100
    ret_real = (np.exp(real[2]) - 1) * 100
    percentil = (azar < ret_real).mean() * 100
    # operaciones fuera de muestra (validación + prueba) para el Monte Carlo
    val = b.simular_nb(o, h, l, c, atrp, entrada, f1, f2, dd, s["tp_atr"], s["sl_atr"], s["max_barras"], True, *b.costos("cripto", ""))[6]
    fuera = np.concatenate([val, real[6]])
    informe.append({**{k2: s[k2] for k2 in ("simbolo", "marco", "direccion", "condiciones", "tp_atr", "sl_atr", "max_barras")},
                    "prueba_pct": round(ret_real, 1), "azar_mediana_pct": round(float(np.median(azar)), 1), "percentil_vs_azar": round(percentil, 1),
                    "ops_fuera_muestra": int(len(fuera)), "rets": fuera.tolist()})
    print(f"   {s['simbolo']:8} {s['marco']:4} {s['direccion']:6} {'+'.join(s['condiciones'])[:28]:28} prueba {ret_real:+6.1f}%  azar mediana {np.median(azar):+6.1f}%  → supera al {percentil:4.1f}% de las copias al azar")

print("\n3) Monte Carlo: 10.000 cuentas que reinvierten todo, remuestreando sus operaciones fuera de muestra (hasta 1.000 operaciones)")
print(f"   {'estrategia':44} {'apal':>4} {'10→1000':>8} {'20→1000':>8} {'quiebra':>8}")
for s in informe[:5]:
    r = np.array(s["rets"])
    for apal in (1, 3, 5, 10):
        res = {}
        for inicio in (10.0, 20.0):
            cap = np.full(10_000, inicio); viva = np.ones(10_000, bool); meta = np.zeros(10_000, bool)
            for _ in range(1000):
                x = rng.choice(r, 10_000)
                cap = np.where(viva, cap * np.maximum(0.0, 1 + apal * x), cap)
                meta |= viva & (cap >= 1000)
                viva &= (cap < 1000) & (cap > 1.0)   # con menos de 1 USD ya no se puede operar
            res[inicio] = (meta.mean(), (cap <= 1.0).mean())
        nombre = f"{s['simbolo']} {s['marco']} {s['direccion']} {'+'.join(s['condiciones'])[:16]}"
        print(f"   {nombre:44} {apal:>3}x {res[10.0][0]:>8.1%} {res[20.0][0]:>8.1%} {res[10.0][1]:>8.1%}")
(RES / "analisis_ganadoras.json").write_text(json.dumps([{k: v for k, v in s.items() if k != "rets"} for s in informe], indent=1, ensure_ascii=False))
