"""Simulador de operaciones con salidas por objetivo (TP), stop (SL) o tiempo máximo, con comisiones y deslizamiento."""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

# Comisiones nivel inicial de Binance (fracción por lado). Entrada a mercado (taker), TP con orden límite (maker), SL y salida por tiempo a mercado.
COSTOS = {
    "spot": {"entrada": 0.0010, "tp": 0.0010, "salida": 0.0010, "desliz": 0.0001},
    "futuros": {"entrada": 0.0005, "tp": 0.0002, "salida": 0.0005, "desliz": 0.0001},
    "sin_costos": {"entrada": 0.0, "tp": 0.0, "salida": 0.0, "desliz": 0.0},
}


@dataclass
class Resultado:
    operaciones: int
    aciertos: float  # % de operaciones ganadoras
    retorno_total: float  # % compuesto sobre el capital, apalancamiento 1x
    factor_beneficio: float
    caida_maxima: float  # % máximo retroceso desde un pico
    promedio_pb: float  # resultado medio por operación en puntos básicos (0,01%)
    rets: np.ndarray

    def resumen(self) -> dict:
        return {k: (round(v, 3) if isinstance(v, float) else v) for k, v in self.__dict__.items() if k != "rets"}


def simular(o, h, l, c, senal: np.ndarray, tp: float, sl: float, max_barras: int, costos: dict) -> Resultado:
    n = len(c)
    candidatas = np.flatnonzero(senal)
    rets = []
    libre_desde = 0
    desl = costos["desliz"]
    for i in candidatas:
        if i < libre_desde or i + 1 >= n:
            continue
        d = int(senal[i])
        e = i + 1
        fin = min(n, e + max_barras)
        p0 = o[e] * (1 + desl * d)
        tp_p = p0 * (1 + tp * d)
        sl_p = p0 * (1 - sl * d)
        hh = h[e:fin]
        ll = l[e:fin]
        if d > 0:
            golpe_sl = ll <= sl_p
            golpe_tp = hh >= tp_p
        else:
            golpe_sl = hh >= sl_p
            golpe_tp = ll <= tp_p
        k_sl = int(np.argmax(golpe_sl)) if golpe_sl.any() else 10**9
        k_tp = int(np.argmax(golpe_tp)) if golpe_tp.any() else 10**9
        if k_sl <= k_tp and k_sl < 10**9:  # si ambos ocurren en la misma vela se asume lo peor
            px = sl_p * (1 - desl * d)
            com = costos["salida"]
            k = k_sl
        elif k_tp < 10**9:
            px = tp_p
            com = costos["tp"]
            k = k_tp
        else:
            k = fin - e - 1
            px = c[e + k] * (1 - desl * d)
            com = costos["salida"]
        rets.append(d * (px / p0 - 1) - costos["entrada"] - com)
        libre_desde = e + k + 1
    r = np.asarray(rets)
    if len(r) == 0:
        return Resultado(0, 0.0, 0.0, 0.0, 0.0, 0.0, r)
    curva = np.cumprod(1 + r)
    picos = np.maximum.accumulate(curva)
    ganan = r[r > 0].sum()
    pierden = -r[r < 0].sum()
    return Resultado(
        operaciones=len(r),
        aciertos=float((r > 0).mean() * 100),
        retorno_total=float((curva[-1] - 1) * 100),
        factor_beneficio=float(ganan / pierden) if pierden > 0 else float("inf"),
        caida_maxima=float(((picos - curva) / picos).max() * 100),
        promedio_pb=float(r.mean() * 10000),
        rets=r,
    )


SALIDAS = [
    (tp, sl, mb)
    for tp in (0.0015, 0.0025, 0.004, 0.006, 0.01)
    for sl in (0.0015, 0.0025, 0.004, 0.006, 0.01)
    for mb in (15, 30, 60)
]
