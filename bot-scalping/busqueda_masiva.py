"""Búsqueda masiva de estrategias: genera N estrategias al azar y las filtra en tres etapas que no se mezclan.

  Datos: 1 año de futuros de Binance, 6 criptomonedas, marcos de 1m, 5m, 15m, 1h y 4h.
  Búsqueda (60% inicial del año) → Validación (20% siguiente) → Prueba final (último 20%, nunca usada para elegir).

  Una estrategia = dirección (compra o venta en corto) + 1 a 3 condiciones (RSI, EMAs, Bollinger, rupturas,
  retornos extremos, volumen, volatilidad, hora del día…) + salida con objetivo/stop en múltiplos de ATR y tiempo máximo.

  Control de suerte: se corre la misma búsqueda con entradas AL AZAR (misma frecuencia). Si las estrategias "reales"
  no pasan los filtros más que las aleatorias, lo que se encontró es casualidad.

Uso: python busqueda_masiva.py --n 1000000
"""
from __future__ import annotations

import argparse
import json
import os
import time
from datetime import date, timedelta
from multiprocessing import Pool
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "1")
import numba as nb
import numpy as np
import pandas as pd

from datos import _descargar_dia
from indicadores import atr, ema, rsi

RAIZ = Path(__file__).resolve().parent
DIR_RES = RAIZ / "resultados"
SIMBOLOS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT", "XRPUSDT", "BNBUSDT"]
MARCOS = ["1min", "5min", "15min", "1h", "4h"]
HASTA = date(2026, 11, 19)
DIAS = 365
# Comisiones de futuros en Binance (nivel inicial): entrada a mercado, objetivo con límite, stop/tiempo a mercado
COM_ENTRADA, COM_TP, COM_SALIDA, DESLIZ = 0.0005, 0.0002, 0.0005, 0.0001
TP_MULT = np.array([0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0])
SL_MULT = np.array([0.5, 1.0, 1.5, 2.0, 3.0, 4.0])
MAX_BARRAS = np.array([3, 5, 10, 20, 50, 100, 200])
MIN_OPS = {"1min": 60, "5min": 50, "15min": 40, "1h": 30, "4h": 20}


# ---------------------------------------------------------------- simulador (compilado)
@nb.njit(cache=True)
def simular_nb(o, h, l, c, atrp, entrada, ini, fin, d, tpm, slm, maxb, guardar, com_ent, com_tp, com_sal, desliz):
    n_ops = 0
    gan = 0
    suma_log = 0.0
    pos = 0.0
    neg = 0.0
    pico = 0.0
    dd = 0.0
    rets = np.empty(fin - ini + 1) if guardar else np.empty(1)
    i = ini
    while i < fin - 1:
        if not entrada[i] or atrp[i] <= 0.0:
            i += 1
            continue
        e = i + 1
        p0 = o[e] * (1.0 + desliz * d)
        tp = p0 * (1.0 + tpm * atrp[i] * d)
        sl = p0 * (1.0 - slm * atrp[i] * d)
        limite = min(fin, e + maxb)
        salida = 0.0
        com = com_sal
        k = e
        cerrado = False
        while k < limite:
            if d > 0:
                if l[k] <= sl:
                    salida = sl * (1.0 - desliz); cerrado = True; break
                if h[k] >= tp:
                    salida = tp; com = com_tp; cerrado = True; break
            else:
                if h[k] >= sl:
                    salida = sl * (1.0 + desliz); cerrado = True; break
                if l[k] <= tp:
                    salida = tp; com = com_tp; cerrado = True; break
            k += 1
        if not cerrado:
            k = limite - 1
            salida = c[k] * (1.0 - desliz * d)
        r = d * (salida / p0 - 1.0) - com_ent - com
        if r <= -0.99:
            r = -0.99
        if guardar:
            rets[n_ops] = r
        n_ops += 1
        if r > 0:
            gan += 1
            pos += r
        else:
            neg -= r
        suma_log += np.log1p(r)
        if suma_log > pico:
            pico = suma_log
        if pico - suma_log > dd:
            dd = pico - suma_log
        i = k + 1
    return n_ops, gan, suma_log, pos, neg, dd, rets[:n_ops]


# ---------------------------------------------------------------- datos y condiciones
def cargar_anio(simbolo: str, universo: str = "cripto", anterior: bool = False) -> pd.DataFrame:
    if universo == "forex":
        import forex
        rango = ("2024-11-01", "2025-11-01") if anterior else ("2025-11-01", "2026-11-01")
        return forex.cargar(simbolo, *rango).set_index("tiempo")
    fin = HASTA - timedelta(days=365) if anterior else HASTA
    partes = [_descargar_dia(simbolo, fin - timedelta(days=i), "futuros") for i in range(DIAS - 1, -1, -1)]
    df = pd.concat([p for p in partes if p is not None], ignore_index=True)
    return df.drop_duplicates("tiempo").sort_values("tiempo").set_index("tiempo")


def costos(universo: str, simbolo: str, cuenta: str = "estandar") -> tuple[float, float, float, float]:
    """(entrada, objetivo, salida, deslizamiento) como fracción del precio por lado."""
    if universo == "forex":
        import forex
        c = forex.COSTOS_FX[cuenta][simbolo]
        return c, c, c, forex.DESLIZ_FX[simbolo]
    return COM_ENTRADA, COM_TP, COM_SALIDA, DESLIZ


def reagrupar(df: pd.DataFrame, marco: str) -> pd.DataFrame:
    if marco == "1min":
        return df.reset_index()
    a = df.resample(marco, label="left", closed="left").agg({"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"})
    return a.dropna().reset_index()


def banco_condiciones(df: pd.DataFrame, fin_busqueda: int):
    """Condiciones booleanas por vela. Los umbrales por cuantiles se calculan SOLO con el tramo de búsqueda."""
    c, h, l, v = df["close"], df["high"], df["low"], df["volume"]
    cond: dict[str, np.ndarray] = {}
    def q(serie, p):
        return float(np.nanquantile(serie.iloc[:fin_busqueda], p))
    for n in (7, 14, 21):
        r = rsi(c, n)
        for u in (20, 25, 30, 35):
            cond[f"rsi{n}<{u}"] = (r < u).to_numpy()
        for u in (65, 70, 75, 80):
            cond[f"rsi{n}>{u}"] = (r > u).to_numpy()
    emas = {n: ema(c, n) for n in (9, 12, 20, 21, 26, 50, 100, 200)}
    for n in (20, 50, 100, 200):
        cond[f"c>ema{n}"] = (c > emas[n]).to_numpy()
        cond[f"c<ema{n}"] = (c < emas[n]).to_numpy()
    for a, b in ((9, 21), (12, 26), (20, 50), (50, 200)):
        dif = np.sign(emas[a] - emas[b]).to_numpy()
        prev = np.roll(dif, 1); prev[0] = 0
        cond[f"ema{a}x↑{b}"] = (dif > 0) & (prev <= 0)
        cond[f"ema{a}x↓{b}"] = (dif < 0) & (prev >= 0)
        cond[f"ema{a}>{b}"] = dif > 0
        cond[f"ema{a}<{b}"] = dif < 0
    media, sd = c.rolling(20).mean(), c.rolling(20).std()
    for k in (2.0, 2.5, 3.0):
        cond[f"c<bb{k}"] = (c < media - k * sd).to_numpy()
        cond[f"c>bb{k}"] = (c > media + k * sd).to_numpy()
    for n in (20, 55, 100):
        cond[f"ruptura↑{n}"] = (c > h.shift(1).rolling(n).max()).to_numpy()
        cond[f"ruptura↓{n}"] = (c < l.shift(1).rolling(n).min()).to_numpy()
    for k in (1, 3, 5, 10, 20):
        ret = c.pct_change(k)
        for p in (0.02, 0.05, 0.10):
            cond[f"ret{k}<p{int(p*100)}"] = (ret < q(ret, p)).to_numpy()
            cond[f"ret{k}>p{int((1-p)*100)}"] = (ret > q(ret, 1 - p)).to_numpy()
    vz = (v - v.rolling(50).mean()) / v.rolling(50).std()
    cond["vol_z>2"] = (vz > 2).to_numpy()
    cond["vol_z>3"] = (vz > 3).to_numpy()
    atrp = (atr(df, 14) / c)
    med = q(atrp, 0.5)
    cond["volatil_alta"] = (atrp > med).to_numpy()
    cond["volatil_baja"] = (atrp <= med).to_numpy()
    hora = df["tiempo"].dt.hour
    cond["hora_asia"] = ((hora >= 0) & (hora < 8)).to_numpy()
    cond["hora_europa"] = ((hora >= 8) & (hora < 14)).to_numpy()
    cond["hora_eeuu"] = ((hora >= 14) & (hora < 21)).to_numpy()
    cond["fin_de_semana"] = (df["tiempo"].dt.day_of_week >= 5).to_numpy()
    cuerpo = (c - df["open"]) / c
    cond["vela_verde_grande"] = (cuerpo > q(cuerpo, 0.95)).to_numpy()
    cond["vela_roja_grande"] = (cuerpo < q(cuerpo, 0.05)).to_numpy()
    nombres = sorted(cond)
    matriz = np.stack([np.nan_to_num(cond[k].astype(bool), nan=False) for k in nombres])
    return nombres, matriz, np.nan_to_num(atrp.to_numpy(), nan=0.0)


# ---------------------------------------------------------------- búsqueda por grupo (par + marco)
def resumen(n, g, sl, pos, neg, dd):
    return {"ops": int(n), "aciertos": round(100 * g / n, 1) if n else 0.0, "retorno": round(100 * (np.exp(sl) - 1), 2),
            "pf": round(pos / neg, 3) if neg > 0 else (99.0 if pos > 0 else 0.0), "caida_max": round(100 * (1 - np.exp(-dd)), 2)}


def buscar_grupo(tarea):
    simbolo, marco, n_estrategias, n_azar, semilla, universo, cuenta = tarea
    rng = np.random.default_rng(semilla)
    cst = costos(universo, simbolo, cuenta)
    df = reagrupar(cargar_anio(simbolo, universo), marco)
    N = len(df)
    f1, f2 = int(N * 0.6), int(N * 0.8)
    nombres, M, atrp = banco_condiciones(df, f1)
    o, h, l, c = (df[k].to_numpy(dtype=np.float64) for k in ("open", "high", "low", "close"))
    min_ops = MIN_OPS[marco]
    embudo = {"probadas": 0, "pasan_busqueda": 0, "pasan_validacion": 0, "positivas_prueba": 0}
    embudo_azar = {"probadas": 0, "pasan_busqueda": 0, "pasan_validacion": 0, "positivas_prueba": 0}
    sobrevivientes = []

    def evaluar(entrada, d, tpm, slm, mb, emb, guardar_info):
        n, g, slog, pos, neg, dd, _ = simular_nb(o, h, l, c, atrp, entrada, 0, f1, d, tpm, slm, mb, False, *cst)
        emb["probadas"] += 1
        if n < min_ops or slog <= 0 or neg <= 0 or pos / neg < 1.1:
            return None
        emb["pasan_busqueda"] += 1
        rv = simular_nb(o, h, l, c, atrp, entrada, f1, f2, d, tpm, slm, mb, False, *cst)
        if rv[0] < max(5, min_ops // 3) or rv[2] <= 0:
            return None
        emb["pasan_validacion"] += 1
        rp = simular_nb(o, h, l, c, atrp, entrada, f2, N, d, tpm, slm, mb, False, *cst)
        if rp[2] > 0:
            emb["positivas_prueba"] += 1
        if not guardar_info:
            return None
        return {"busqueda": resumen(n, g, slog, pos, neg, dd), "validacion": resumen(*rv[:6]), "prueba": resumen(*rp[:6]),
                "log_bv": float(slog + rv[2])}

    for _ in range(n_estrategias):
        k = int(rng.integers(1, 4))
        idx = rng.choice(len(nombres), size=k, replace=False)
        entrada = M[idx[0]].copy()
        for j in idx[1:]:
            entrada &= M[j]
        d = 1 if rng.random() < 0.5 else -1
        tpm, slm, mb = float(rng.choice(TP_MULT)), float(rng.choice(SL_MULT)), int(rng.choice(MAX_BARRAS))
        r = evaluar(entrada, d, tpm, slm, mb, embudo, True)
        if r:
            r.update({"universo": universo, "cuenta": cuenta, "simbolo": simbolo, "marco": marco, "direccion": "compra" if d > 0 else "venta",
                      "condiciones": [nombres[j] for j in idx], "tp_atr": tpm, "sl_atr": slm, "max_barras": mb})
            sobrevivientes.append(r)
        if n_azar and rng.random() < n_azar / n_estrategias:
            # Control: entradas al azar con la misma frecuencia que esta estrategia
            p = max(entrada[:f1].mean(), 1e-5)
            azar = rng.random(N) < p
            evaluar(azar, d, tpm, slm, mb, embudo_azar, False)
    return {"universo": universo, "cuenta": cuenta, "simbolo": simbolo, "marco": marco, "embudo": embudo, "embudo_azar": embudo_azar, "sobrevivientes": sobrevivientes}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=1_000_000)
    ap.add_argument("--azar", type=float, default=0.2, help="fracción de pruebas de control con entradas al azar")
    ap.add_argument("--universo", choices=["cripto", "forex"], default="cripto")
    ap.add_argument("--cuenta", choices=["estandar", "ecn"], default="estandar", help="solo forex: tipo de cuenta del bróker")
    a = ap.parse_args()
    t0 = time.time()
    if a.universo == "forex":
        import forex
        simbolos = forex.INSTRUMENTOS
    else:
        simbolos = SIMBOLOS
    grupos = [(s, m) for s in simbolos for m in MARCOS]
    por_grupo = a.n // len(grupos)
    # Partir cada grupo en trozos para repartir carga entre núcleos
    trozos = 8
    tareas = [(s, m, por_grupo // trozos, int(por_grupo // trozos * a.azar), hash((s, m, t)) % 2**32, a.universo, a.cuenta)
              for s, m in grupos for t in range(trozos)]
    # Compilar el simulador una vez antes de repartir
    z = np.zeros(10)
    simular_nb(z + 1, z + 1, z + 1, z + 1, z + 0.01, np.zeros(10, dtype=np.bool_), 0, 10, 1, 1.0, 1.0, 3, False, 0.0, 0.0, 0.0, 0.0)
    resultados = []
    with Pool() as pool:
        for i, r in enumerate(pool.imap_unordered(buscar_grupo, tareas), 1):
            resultados.append(r)
            e = r["embudo"]
            print(f"[{i}/{len(tareas)}] {r['simbolo']} {r['marco']}: {e['probadas']} probadas, {e['pasan_busqueda']} pasan búsqueda, "
                  f"{e['pasan_validacion']} pasan validación, {e['positivas_prueba']} positivas en prueba · {time.time() - t0:.0f}s", flush=True)
    total = {k: sum(r["embudo"][k] for r in resultados) for k in resultados[0]["embudo"]}
    total_azar = {k: sum(r["embudo_azar"][k] for r in resultados) for k in resultados[0]["embudo_azar"]}
    sobrev = [s for r in resultados for s in r["sobrevivientes"]]
    sobrev.sort(key=lambda s: -s["log_bv"])
    DIR_RES.mkdir(exist_ok=True)
    nombre = "busqueda_masiva.json" if a.universo == "cripto" else f"busqueda_masiva_forex_{a.cuenta}.json"
    (DIR_RES / nombre).write_text(json.dumps({"n": a.n, "embudo": total, "embudo_azar": total_azar,
        "segundos": round(time.time() - t0), "sobrevivientes": sobrev[:2000]}, ensure_ascii=False, indent=1))
    print("\nEMBUDO estrategias:", total)
    print("EMBUDO al azar     :", total_azar)
    print(f"Tiempo total: {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
