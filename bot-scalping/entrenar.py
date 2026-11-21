"""Entrenamiento con validación fuera de muestra.

1) Reglas: para cada estrategia, mercado y par prueba todas las combinaciones de parámetros y salidas (TP/SL/tiempo)
   en los primeros 60 días ("entrenamiento"), elige la mejor y la evalúa en los días restantes ("prueba"),
   que el optimizador nunca vio. Solo el resultado de prueba indica si la estrategia sirve.
2) Modelo: un clasificador (gradient boosting) aprende a predecir si una operación tocará el objetivo antes que el stop.
   Se entrena con los días 0-45, se ajusta el umbral con los días 45-60 y se evalúa en los días 60 en adelante.
"""
from __future__ import annotations

import json
import sys
import time
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier

from backtest import COSTOS, SALIDAS, simular
from datos import cargar
from estrategias import ESTRATEGIAS, combinaciones, senales
from indicadores import variables_modelo

RAIZ = Path(__file__).resolve().parent
DIR_RES = RAIZ / "resultados"
DIAS_ENTRENO = 60
MIN_OPS_ENTRENO = 60
SIMBOLOS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"]


def partir(df: pd.DataFrame, dia_corte: int) -> int:
    corte = df["tiempo"].iloc[0].normalize() + pd.Timedelta(days=dia_corte)
    return int((df["tiempo"] < corte).sum())


def arrays(df: pd.DataFrame):
    return [df[k].to_numpy() for k in ("open", "high", "low", "close")]


def optimizar(tarea):
    mercado, simbolo, estrategia = tarea
    df = cargar(simbolo, mercado=mercado)
    corte = partir(df, DIAS_ENTRENO)
    ent, pru = df.iloc[:corte].reset_index(drop=True), df.iloc[corte:].reset_index(drop=True)
    a_ent, a_pru = arrays(ent), arrays(pru)
    costos = COSTOS[mercado]
    cortos = mercado == "futuros"
    mejor = None
    rentables_ent = 0
    probadas = 0
    for params in combinaciones(estrategia):
        s_ent = senales(estrategia, ent, params, cortos)
        for tp, sl, mb in SALIDAS:
            r = simular(*a_ent, s_ent, tp, sl, mb, costos)
            probadas += 1
            if r.operaciones < MIN_OPS_ENTRENO:
                continue
            if r.retorno_total > 0:
                rentables_ent += 1
            if mejor is None or r.retorno_total > mejor[0].retorno_total:
                mejor = (r, params, tp, sl, mb)
    if mejor is None:
        return {"mercado": mercado, "simbolo": simbolo, "estrategia": estrategia, "sin_resultado": True}
    r_ent, params, tp, sl, mb = mejor
    s_pru = senales(estrategia, pru, params, cortos)
    r_pru = simular(*a_pru, s_pru, tp, sl, mb, costos)
    r_pru_bruto = simular(*a_pru, s_pru, tp, sl, mb, COSTOS["sin_costos"])
    return {
        "mercado": mercado, "simbolo": simbolo, "estrategia": estrategia,
        "params": params, "tp": tp, "sl": sl, "max_barras": mb,
        "combinaciones": probadas, "rentables_en_entreno": rentables_ent,
        "entreno": r_ent.resumen(), "prueba": r_pru.resumen(), "prueba_sin_costos": r_pru_bruto.resumen(),
    }


# ---------- Modelo de aprendizaje automático ----------
TP_ML, SL_ML, H_ML = 0.005, 0.004, 60


def etiquetas(o, h, l, n_barras, tp, sl):
    """1 si una operación abierta en la apertura de la vela siguiente toca TP antes que SL dentro de H velas."""
    n = len(o)
    largo = np.zeros(n, dtype=np.int8)
    corto = np.zeros(n, dtype=np.int8)
    for i in range(n - 2):
        e = i + 1
        fin = min(n, e + n_barras)
        p0 = o[e]
        hh, ll = h[e:fin], l[e:fin]
        a = np.flatnonzero(hh >= p0 * (1 + tp)); b = np.flatnonzero(ll <= p0 * (1 - sl))
        largo[i] = 1 if len(a) and (not len(b) or a[0] < b[0]) else 0
        a = np.flatnonzero(ll <= p0 * (1 - tp)); b = np.flatnonzero(hh >= p0 * (1 + sl))
        corto[i] = 1 if len(a) and (not len(b) or a[0] < b[0]) else 0
    return largo, corto


def modelo(simbolo: str, mercado: str = "futuros") -> dict:
    df = cargar(simbolo, mercado=mercado)
    X = variables_modelo(df)
    o, h, l, c = arrays(df)
    y_l, y_c = etiquetas(o, h, l, H_ML, TP_ML, SL_ML)
    c45, c60 = partir(df, 45), partir(df, DIAS_ENTRENO)
    valido = X.notna().all(axis=1).to_numpy()
    ent = np.arange(len(df)) < c45
    ent &= valido
    ent[c45 - H_ML - 1 : c45] = False  # sin solapamiento de etiquetas con validación
    clf_l = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_leaf_nodes=31, l2_regularization=1.0, random_state=0)
    clf_c = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_leaf_nodes=31, l2_regularization=1.0, random_state=0)
    clf_l.fit(X[ent], y_l[ent])
    clf_c.fit(X[ent], y_c[ent])
    Xf = X.fillna(0)
    p_l = clf_l.predict_proba(Xf)[:, 1]
    p_c = clf_c.predict_proba(Xf)[:, 1]
    base = float(y_l[ent].mean())

    def senal(umbral):
        s = np.zeros(len(df), dtype=np.int8)
        s[(p_l > umbral) & (p_l >= p_c) & valido] = 1
        s[(p_c > umbral) & (p_c > p_l) & valido] = -1
        return s

    def tramo(a, b, s, costos):
        return simular(o[a:b], h[a:b], l[a:b], c[a:b], s[a:b], TP_ML, SL_ML, H_ML, costos)

    mejor = None
    for u in (0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75):
        r = tramo(c45, c60, senal(u), COSTOS[mercado])
        if r.operaciones >= 20 and (mejor is None or r.retorno_total > mejor[1].retorno_total):
            mejor = (u, r)
    if mejor is None:
        return {"simbolo": simbolo, "modelo": "sin operaciones suficientes"}
    u, r_val = mejor
    s = senal(u)
    return {
        "simbolo": simbolo, "mercado": mercado, "umbral": u, "tasa_base_tp": round(base * 100, 1),
        "validacion": r_val.resumen(),
        "prueba": tramo(c60, len(df), s, COSTOS[mercado]).resumen(),
        "prueba_sin_costos": tramo(c60, len(df), s, COSTOS["sin_costos"]).resumen(),
    }


def tabla(filas, titulo):
    lineas = [f"### {titulo}", "", "| Mercado | Par | Estrategia | Entreno ops | Entreno % | Prueba ops | Prueba % | Prueba sin comisiones % | Aciertos prueba | PF prueba |", "|---|---|---|---|---|---|---|---|---|---|"]
    for f in filas:
        if f.get("sin_resultado"):
            continue
        e, p, b = f["entreno"], f["prueba"], f["prueba_sin_costos"]
        lineas.append(f"| {f['mercado']} | {f['simbolo']} | {f['estrategia']} | {e['operaciones']} | {e['retorno_total']:+.1f} | {p['operaciones']} | {p['retorno_total']:+.1f} | {b['retorno_total']:+.1f} | {p['aciertos']:.0f}% | {p['factor_beneficio']:.2f} |")
    return "\n".join(lineas)


if __name__ == "__main__":
    t0 = time.time()
    DIR_RES.mkdir(exist_ok=True)
    mercados = [m for m in ("spot", "futuros") if f"--solo-{m}" not in sys.argv]
    tareas = [(m, s, e) for m in mercados for s in SIMBOLOS for e in ESTRATEGIAS]
    for m in mercados:  # descargar antes de repartir el trabajo
        for s in SIMBOLOS:
            cargar(s, mercado=m)
    # Reanudable: cada resultado se guarda en parcial.jsonl en cuanto termina
    parcial = DIR_RES / "parcial.jsonl"
    hechas = {}
    if parcial.exists():
        for linea in parcial.read_text().splitlines():
            f = json.loads(linea)
            hechas[(f["mercado"], f["simbolo"], f["estrategia"])] = f
    pendientes = [t for t in tareas if t not in hechas]
    print(f"Reglas: {len(hechas)} ya hechas, {len(pendientes)} pendientes", flush=True)
    with Pool() as pool, parcial.open("a") as out:
        for f in pool.imap_unordered(optimizar, pendientes):
            hechas[(f["mercado"], f["simbolo"], f["estrategia"])] = f
            out.write(json.dumps(f, ensure_ascii=False) + "\n")
            out.flush()
            print(f"  [{len(hechas)}/{len(tareas)}] {f['mercado']} {f['simbolo']} {f['estrategia']}: prueba {f.get('prueba', {}).get('retorno_total', 'n/a')}", flush=True)
    filas = [hechas[t] for t in tareas]
    print(f"Reglas: {len(tareas)} combinaciones estrategia/par/mercado en {time.time() - t0:.0f} s", flush=True)
    with Pool() as pool:
        ml = pool.map(modelo, SIMBOLOS)
    print(f"Modelo: listo en {time.time() - t0:.0f} s")
    (DIR_RES / "resultados.json").write_text(json.dumps({"reglas": filas, "modelo": ml}, indent=2, ensure_ascii=False))
    validas = [f for f in filas if not f.get("sin_resultado")]
    positivas = [f for f in validas if f["prueba"]["retorno_total"] > 0]
    print(tabla(validas, "Reglas: mejor configuración de entrenamiento evaluada en prueba"))
    print(f"\nPositivas en prueba: {len(positivas)} de {len(validas)}")
    for m in ml:
        print(json.dumps(m, ensure_ascii=False))
