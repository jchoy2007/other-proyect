"""Indicadores técnicos vectorizados (numpy/pandas) y las variables que usa el modelo."""
from __future__ import annotations

import numpy as np
import pandas as pd


def ema(x: pd.Series, n: int) -> pd.Series:
    return x.ewm(span=n, adjust=False).mean()


def rsi(close: pd.Series, n: int = 14) -> pd.Series:
    d = close.diff()
    sube = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    baja = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    rs = sube / baja.replace(0, np.nan)
    return (100 - 100 / (1 + rs)).fillna(50)


def atr(df: pd.DataFrame, n: int = 14) -> pd.Series:
    prev = df["close"].shift()
    tr = pd.concat([df["high"] - df["low"], (df["high"] - prev).abs(), (df["low"] - prev).abs()], axis=1).max(axis=1)
    return tr.ewm(alpha=1 / n, adjust=False).mean()


def bollinger(close: pd.Series, n: int = 20, k: float = 2.0) -> tuple[pd.Series, pd.Series, pd.Series]:
    media = close.rolling(n).mean()
    sd = close.rolling(n).std()
    return media - k * sd, media, media + k * sd


def vwap_movil(df: pd.DataFrame, n: int = 60) -> pd.Series:
    tp = (df["high"] + df["low"] + df["close"]) / 3
    return (tp * df["volume"]).rolling(n).sum() / df["volume"].rolling(n).sum()


def variables_modelo(df: pd.DataFrame) -> pd.DataFrame:
    """Variables para el modelo de aprendizaje automático. Solo usan información hasta el cierre de cada vela."""
    c = df["close"]
    f = pd.DataFrame(index=df.index)
    for n in (1, 3, 5, 15, 30, 60):
        f[f"ret_{n}"] = c.pct_change(n)
    f["rsi_7"] = rsi(c, 7)
    f["rsi_14"] = rsi(c, 14)
    f["atr_pct"] = atr(df, 14) / c
    inf, med, sup = bollinger(c, 20, 2)
    f["pos_bb"] = (c - inf) / (sup - inf).replace(0, np.nan)
    f["dist_ema20"] = c / ema(c, 20) - 1
    f["dist_ema100"] = c / ema(c, 100) - 1
    f["dist_vwap"] = c / vwap_movil(df, 60) - 1
    vol = df["volume"]
    f["vol_z"] = (vol - vol.rolling(60).mean()) / vol.rolling(60).std().replace(0, np.nan)
    f["rango_pct"] = (df["high"] - df["low"]) / c
    f["mecha_inf"] = (df[["open", "close"]].min(axis=1) - df["low"]) / c
    f["mecha_sup"] = (df["high"] - df[["open", "close"]].max(axis=1)) / c
    minuto = df["tiempo"].dt.hour * 60 + df["tiempo"].dt.minute
    f["hora_sin"] = np.sin(2 * np.pi * minuto / 1440)
    f["hora_cos"] = np.cos(2 * np.pi * minuto / 1440)
    return f.replace([np.inf, -np.inf], np.nan)
