"""Datos de 1 minuto de divisas y oro (HistData.com, gratis) con caché local.

HistData publica precios BID en hora EST fija (UTC-5, sin horario de verano); aquí se convierten a UTC.
Años completos anteriores vienen en un solo archivo; el año en curso viene por meses."""
from __future__ import annotations

import io
import re
import sys
import time
import urllib.parse
import urllib.request
import zipfile
from http.cookiejar import CookieJar
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent
DIR = RAIZ / "datos" / "forex"
BASE = "https://www.histdata.com/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/{par}/{periodo}"
INSTRUMENTOS = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"]

# Costo por lado (fracción del precio) = medio spread + comisión. Dos tipos de cuenta típicos de brókers MT4/MT5.
#  estándar: sin comisión, spread más ancho (las cuentas que aceptan 5-10 USD suelen ser de este tipo o "cent")
#  ecn:      spread bruto + 3,5 USD por lado por lote (suelen pedir 100-200 USD de depósito)
COSTOS_FX = {
    "estandar": {"XAUUSD": 0.35 / 4000 / 2, "EURUSD": 0.00012 / 1.10 / 2, "GBPUSD": 0.00016 / 1.30 / 2, "USDJPY": 0.014 / 150 / 2},
    "ecn": {"XAUUSD": 0.15 / 4000 / 2 + 3.5 / 400_000, "EURUSD": 0.00002 / 1.10 / 2 + 3.5 / 110_000,
            "GBPUSD": 0.00004 / 1.30 / 2 + 3.5 / 130_000, "USDJPY": 0.003 / 150 / 2 + 3.5 / 100_000},
}
DESLIZ_FX = {"XAUUSD": 0.00002, "EURUSD": 0.00001, "GBPUSD": 0.00001, "USDJPY": 0.00001}


def _descargar(par: str, periodo: str) -> pd.DataFrame | None:
    destino = DIR / par / f"{periodo}.parquet"
    if destino.exists():
        return pd.read_parquet(destino)
    jar = CookieJar()
    abridor = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    abridor.addheaders = [("User-Agent", "Mozilla/5.0")]
    pagina_url = BASE.format(par=par.lower(), periodo=periodo)
    pagina = abridor.open(pagina_url, timeout=30).read().decode("utf-8", "replace")
    form = re.search(r'<form id="file_down".*?</form>', pagina, re.S)
    if not form:
        print(f"  {par} {periodo}: sin archivo", file=sys.stderr)
        return None
    campos = dict(re.findall(r'name="(\w+)" id="\w+" value="([^"]*)"', form.group(0)))
    req = urllib.request.Request("https://www.histdata.com/get.php", data=urllib.parse.urlencode(campos).encode(),
                                 headers={"Referer": pagina_url, "User-Agent": "Mozilla/5.0"})
    contenido = abridor.open(req, timeout=120).read()
    try:
        z = zipfile.ZipFile(io.BytesIO(contenido))
    except zipfile.BadZipFile:
        print(f"  {par} {periodo}: respuesta no es zip ({len(contenido)} bytes)", file=sys.stderr)
        return None
    nombre = next(n for n in z.namelist() if n.endswith(".csv"))
    df = pd.read_csv(z.open(nombre), sep=";", header=None, names=["t", "open", "high", "low", "close", "volume"])
    df["tiempo"] = pd.to_datetime(df["t"], format="%Y%m%d %H%M%S").dt.tz_localize("UTC") + pd.Timedelta(hours=5)
    df = df[["tiempo", "open", "high", "low", "close"]].astype({"open": float, "high": float, "low": float, "close": float})
    df["volume"] = 1.0  # HistData no trae volumen; las condiciones de volumen no aplican a divisas
    destino.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(destino, index=False)
    time.sleep(2)  # ser amables con el servidor
    return df


def cargar(par: str, desde: str, hasta: str) -> pd.DataFrame:
    """Velas de 1 minuto entre dos fechas 'AAAA-MM-DD' (UTC)."""
    ini, fin = pd.Timestamp(desde, tz="UTC"), pd.Timestamp(hasta, tz="UTC")
    anio_actual = pd.Timestamp.now(tz="UTC").year
    partes = []
    for anio in range(ini.year, fin.year + 1):
        if anio < anio_actual:
            partes.append(_descargar(par, str(anio)))
        else:
            for mes in range(1, 13):
                if pd.Timestamp(f"{anio}-{mes:02d}-01", tz="UTC") > fin:
                    break
                partes.append(_descargar(par, f"{anio}/{mes}"))
    df = pd.concat([p for p in partes if p is not None], ignore_index=True)
    df = df[(df["tiempo"] >= ini) & (df["tiempo"] < fin)]
    return df.drop_duplicates("tiempo").sort_values("tiempo").reset_index(drop=True)


if __name__ == "__main__":
    for par in sys.argv[1:] or INSTRUMENTOS:
        df = cargar(par, "2024-11-01", "2026-11-01")
        print(f"{par}: {len(df):,} velas de {df['tiempo'].iloc[0]} a {df['tiempo'].iloc[-1]} · precio {df['close'].iloc[0]:.5g} → {df['close'].iloc[-1]:.5g}", flush=True)
