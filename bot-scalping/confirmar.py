"""Confirma las mejores estrategias de una búsqueda masiva (cripto o forex):
  1) movimiento del mercado en cada tramo,
  2) su resultado en la prueba frente a 1.000 copias con entradas al azar,
  3) el mismo sistema, sin cambios, en el AÑO ANTERIOR (nunca visto),
  4) Monte Carlo 10/20 USD → 1.000 USD con sus operaciones fuera de muestra.
Uso: python confirmar.py resultados/busqueda_masiva_forex_estandar.json"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

import busqueda_masiva as b

archivo = Path(sys.argv[1])
d = json.loads(archivo.read_text())
rng = np.random.default_rng(0)
top, vistos = [], set()
for s in d["sobrevivientes"]:
    clave = (s["simbolo"], s["marco"], s["direccion"], tuple(s["condiciones"]), s["tp_atr"], s["sl_atr"], s["max_barras"])
    if clave not in vistos:
        vistos.add(clave)
        top.append(s)
    if len(top) == 10:
        break
universo, cuenta = top[0].get("universo", "cripto"), top[0].get("cuenta", "estandar")
print(f"Universo {universo} · cuenta {cuenta} · {d['n']:,} estrategias probadas")

cache = {}
def preparar(simbolo, marco, anterior):
    k = (simbolo, marco, anterior)
    if k not in cache:
        df = b.reagrupar(b.cargar_anio(simbolo, universo, anterior), marco)
        N = len(df)
        nombres, M, atrp = b.banco_condiciones(df, int(N * 0.6))
        cache[k] = (df, N, nombres, M, atrp)
    return cache[k]

print("\n1) Movimiento del precio (búsqueda | validación | prueba) y año anterior completo")
for sim in sorted({s["simbolo"] for s in top}):
    df, N, *_ = preparar(sim, "1h", False)
    c = df["close"].to_numpy(); f1, f2 = int(N * .6), int(N * .8)
    dfa, Na, *_ = preparar(sim, "1h", True)
    ca = dfa["close"].to_numpy()
    print(f"   {sim:9} {100*(c[f1]/c[0]-1):+6.1f}% | {100*(c[f2]/c[f1]-1):+6.1f}% | {100*(c[-1]/c[f2]-1):+6.1f}%    año anterior {100*(ca[-1]/ca[0]-1):+6.1f}%")

def entrada_de(s, M, nombres, N):
    e = np.ones(N, dtype=bool)
    for nom in s["condiciones"]:
        e &= M[nombres.index(nom)]
    return e

print("\n2) y 3) Cada estrategia: prueba vs 1.000 copias al azar, y año anterior sin cambios")
filas = []
for s in top:
    cst = b.costos(universo, s["simbolo"], cuenta)
    dd = 1 if s["direccion"] == "compra" else -1
    args = (s["tp_atr"], s["sl_atr"], s["max_barras"])
    df, N, nombres, M, atrp = preparar(s["simbolo"], s["marco"], False)
    o, h, l, c = (df[x].to_numpy(dtype=np.float64) for x in ("open", "high", "low", "close"))
    f1, f2 = int(N * .6), int(N * .8)
    ent = entrada_de(s, M, nombres, N)
    real = b.simular_nb(o, h, l, c, atrp, ent, f2, N, dd, *args, True, *cst)
    val = b.simular_nb(o, h, l, c, atrp, ent, f1, f2, dd, *args, True, *cst)
    p = max(ent[f2:].mean(), 1e-4)
    azar = np.array([np.exp(b.simular_nb(o, h, l, c, atrp, rng.random(N) < p, f2, N, dd, *args, False, *cst)[2]) - 1 for _ in range(1000)]) * 100
    ret = (np.exp(real[2]) - 1) * 100
    pct = (azar < ret).mean() * 100
    dfa, Na, na, Ma, atrpa = preparar(s["simbolo"], s["marco"], True)
    oa, ha, la, ca = (dfa[x].to_numpy(dtype=np.float64) for x in ("open", "high", "low", "close"))
    ra = b.simular_nb(oa, ha, la, ca, atrpa, entrada_de(s, Ma, na, Na), 0, Na, dd, *args, True, *cst)
    anterior = b.resumen(*ra[:6])
    filas.append({**{k: s[k] for k in ("simbolo", "marco", "direccion", "condiciones", "tp_atr", "sl_atr", "max_barras")},
                  "prueba_pct": round(ret, 1), "azar_mediana_pct": round(float(np.median(azar)), 1), "percentil_vs_azar": round(pct, 1),
                  "anio_anterior": anterior, "rets_fuera": np.concatenate([val[6], real[6]]).tolist(), "rets_anterior": ra[6].tolist()})
    print(f"   {s['simbolo']:7} {s['marco']:5} {s['direccion']:6} {'+'.join(s['condiciones'])[:26]:26} prueba {ret:+6.1f}% (azar {np.median(azar):+5.1f}%, supera al {pct:4.1f}%) | año anterior {anterior['retorno']:+6.1f}% ({anterior['ops']} ops, caída {anterior['caida_max']}%)")

print("\n4) Monte Carlo 10.000 cuentas que reinvierten todo (hasta 1.000 operaciones). Arriba: operaciones fuera de muestra del año reciente. Abajo: operaciones del año anterior.")
print(f"   {'estrategia':40} {'apal':>4} | {'10→1000':>8} {'quiebra':>8} | {'año ant. 10→1000':>17} {'quiebra':>8}")
for s in filas[:5]:
    for apal in (1, 5, 10, 20):
        out = []
        for r in (np.array(s["rets_fuera"]), np.array(s["rets_anterior"])):
            if len(r) == 0:
                out += [0.0, 0.0]; continue
            cap = np.full(10_000, 10.0); viva = np.ones(10_000, bool); meta = np.zeros(10_000, bool)
            for _ in range(1000):
                cap = np.where(viva, cap * np.maximum(0.0, 1 + apal * rng.choice(r, 10_000)), cap)
                meta |= viva & (cap >= 1000)
                viva &= (cap < 1000) & (cap > 1.0)
            out += [meta.mean(), (cap <= 1.0).mean()]
        nombre = f"{s['simbolo']} {s['marco']} {s['direccion']} {'+'.join(s['condiciones'])[:14]}"
        print(f"   {nombre:40} {apal:>3}x | {out[0]:>8.1%} {out[1]:>8.1%} | {out[2]:>17.1%} {out[3]:>8.1%}")
salida = archivo.with_name(archivo.stem + "_confirmacion.json")
salida.write_text(json.dumps([{k: v for k, v in f.items() if not k.startswith("rets")} for f in filas], indent=1, ensure_ascii=False))
