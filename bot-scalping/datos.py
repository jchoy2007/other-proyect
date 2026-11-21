"""Descarga velas de 1 minuto de Binance (archivos públicos de data.binance.vision) y las guarda en caché."""
from __future__ import annotations

import io
import sys
import zipfile
import urllib.request
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parent
DIR_DATOS = RAIZ / "datos"
COLUMNAS = ["abre_ts", "open", "high", "low", "close", "volume", "cierra_ts", "quote_volume", "trades", "taker_base", "taker_quote", "ignorar"]
URLS = {
    "spot": "https://data.binance.vision/data/spot/daily/klines/{s}/1m/{s}-1m-{d}.zip",
    "futuros": "https://data.binance.vision/data/futures/um/daily/klines/{s}/1m/{s}-1m-{d}.zip",
}


def _descargar_dia(simbolo: str, dia: date, mercado: str = "spot") -> pd.DataFrame | None:
    destino = DIR_DATOS / mercado / simbolo / f"{dia.isoformat()}.parquet"
    if destino.exists():
        return pd.read_parquet(destino)
    try:
        with urllib.request.urlopen(URLS[mercado].format(s=simbolo, d=dia.isoformat()), timeout=30) as r:
            contenido = r.read()
    except Exception as e:  # el día aún no está publicado o no existe
        print(f"  {simbolo} {dia}: sin datos ({e})", file=sys.stderr)
        return None
    with zipfile.ZipFile(io.BytesIO(contenido)) as z:
        with z.open(z.namelist()[0]) as f:
            df = pd.read_csv(f, header=None, names=COLUMNAS)
    # Los archivos de futuros traen una fila de encabezado
    df = df[pd.to_numeric(df["abre_ts"], errors="coerce").notna()]
    ts = pd.to_numeric(df["abre_ts"]).astype("int64")
    # Desde 2025 Binance publica los tiempos en microsegundos; antes, en milisegundos
    unidad = "us" if ts.iloc[0] > 10**14 else "ms"
    df["tiempo"] = pd.to_datetime(ts, unit=unidad, utc=True)
    df = df[["tiempo", "open", "high", "low", "close", "volume", "trades"]].astype(
        {"open": "float64", "high": "float64", "low": "float64", "close": "float64", "volume": "float64", "trades": "int64"}
    )
    destino.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(destino, index=False)
    return df


def cargar(simbolo: str, dias: int = 90, hasta: date | None = None, mercado: str = "spot") -> pd.DataFrame:
    """Velas de 1 minuto de los últimos `dias` días completos (hasta ayer por defecto)."""
    hasta = hasta or (date.today() - timedelta(days=1))
    partes = []
    for i in range(dias, 0, -1):
        d = hasta - timedelta(days=i - 1)
        df = _descargar_dia(simbolo, d, mercado)
        if df is not None:
            partes.append(df)
    if not partes:
        raise RuntimeError(f"No hay datos para {simbolo}")
    df = pd.concat(partes, ignore_index=True).drop_duplicates("tiempo").sort_values("tiempo").reset_index(drop=True)
    return df


if __name__ == "__main__":
    args = sys.argv[1:]
    mercado = "futuros" if "--futuros" in args else "spot"
    simbolos = [a for a in args if not a.startswith("--")] or ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"]
    for s in simbolos:
        df = cargar(s, mercado=mercado)
        print(f"{s} ({mercado}): {len(df):,} velas de {df['tiempo'].iloc[0]} a {df['tiempo'].iloc[-1]}")
