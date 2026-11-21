"""Estrategias de scalping. Cada una devuelve un array por vela: +1 abrir compra, -1 abrir venta en corto, 0 nada.
La señal se calcula al cierre de la vela i y la orden se ejecuta en la apertura de la vela i+1 (sin mirar el futuro)."""
from __future__ import annotations

import itertools
import numpy as np
import pandas as pd

from indicadores import bollinger, ema, rsi, vwap_movil


def cruce_ema(df: pd.DataFrame, rapida: int, lenta: int) -> np.ndarray:
    c = df["close"]
    d = np.sign(ema(c, rapida) - ema(c, lenta)).to_numpy()
    prev = np.roll(d, 1)
    prev[0] = 0
    s = np.zeros(len(df), dtype=np.int8)
    s[(d > 0) & (prev <= 0)] = 1
    s[(d < 0) & (prev >= 0)] = -1
    s[: lenta * 3] = 0
    return s


def rebote_bollinger(df: pd.DataFrame, n: int, k: float, rsi_lim: int) -> np.ndarray:
    c = df["close"]
    inf, _, sup = bollinger(c, n, k)
    r = rsi(c, 7)
    s = np.zeros(len(df), dtype=np.int8)
    s[((c < inf) & (r < rsi_lim)).to_numpy()] = 1
    s[((c > sup) & (r > 100 - rsi_lim)).to_numpy()] = -1
    return s


def ruptura(df: pd.DataFrame, n: int, vol_mult: float) -> np.ndarray:
    maximo = df["high"].shift(1).rolling(n).max()
    minimo = df["low"].shift(1).rolling(n).min()
    vol_ok = df["volume"] > vol_mult * df["volume"].shift(1).rolling(n).mean()
    s = np.zeros(len(df), dtype=np.int8)
    s[((df["close"] > maximo) & vol_ok).to_numpy()] = 1
    s[((df["close"] < minimo) & vol_ok).to_numpy()] = -1
    return s


def reversion_vwap(df: pd.DataFrame, n: int, z: float) -> np.ndarray:
    dif = df["close"] - vwap_movil(df, n)
    zs = dif / dif.rolling(n).std()
    s = np.zeros(len(df), dtype=np.int8)
    s[(zs < -z).to_numpy()] = 1
    s[(zs > z).to_numpy()] = -1
    return s


ESTRATEGIAS = {
    "cruce_ema": (cruce_ema, {"rapida": [5, 9, 12], "lenta": [21, 34, 55]}),
    "rebote_bollinger": (rebote_bollinger, {"n": [20, 40], "k": [2.0, 2.5, 3.0], "rsi_lim": [20, 30]}),
    "ruptura": (ruptura, {"n": [15, 30, 60], "vol_mult": [1.5, 2.5, 4.0]}),
    "reversion_vwap": (reversion_vwap, {"n": [30, 60, 120], "z": [2.0, 2.5, 3.0]}),
}


def combinaciones(nombre: str):
    fn, rejilla = ESTRATEGIAS[nombre]
    claves = list(rejilla)
    for valores in itertools.product(*(rejilla[k] for k in claves)):
        params = dict(zip(claves, valores))
        if nombre == "cruce_ema" and params["rapida"] >= params["lenta"]:
            continue
        yield params


def senales(nombre: str, df: pd.DataFrame, params: dict, permitir_cortos: bool) -> np.ndarray:
    s = ESTRATEGIAS[nombre][0](df, **params)
    if not permitir_cortos:
        s = np.where(s > 0, s, 0).astype(np.int8)
    return s
