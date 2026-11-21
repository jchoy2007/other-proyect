"""OANDA (divisas y CFD). Demo oficial: https://api-fxpractice.oanda.com (token de una cuenta de práctica).
Real: https://api-fxtrade.oanda.com. El stop y el objetivo quedan en el servidor de OANDA al abrir la operación."""
from __future__ import annotations

import json
import os
import urllib.request

import pandas as pd

URL = {"demo": "https://api-fxpractice.oanda.com", "real": "https://api-fxtrade.oanda.com"}


class Oanda:
    nombre = "oanda"

    def __init__(self, modo: str = "demo"):
        self.modo = modo
        self.base = URL[modo]
        # En la nube de Claude el token lo inyecta el proxy; en tu equipo, ponlo en OANDA_TOKEN
        self.token = os.environ.get("OANDA_TOKEN_DEMO" if modo == "demo" else "OANDA_TOKEN", "inyectado-por-proxy")
        self._cuenta = os.environ.get("OANDA_CUENTA", "")

    def _pedir(self, metodo: str, ruta: str, cuerpo: dict | None = None):
        datos = json.dumps(cuerpo).encode() if cuerpo else None
        req = urllib.request.Request(f"{self.base}{ruta}", data=datos, method=metodo, headers={
            "Authorization": f"Bearer {self.token}", "Content-Type": "application/json", "Accept-Datetime-Format": "UNIX"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"OANDA {e.code}: {e.read().decode()[:300]}") from None

    @property
    def cuenta(self) -> str:
        if not self._cuenta:
            self._cuenta = self._pedir("GET", "/v3/accounts")["accounts"][0]["id"]
        return self._cuenta

    def velas(self, instrumento: str, n: int = 300, desde: float | None = None) -> pd.DataFrame:
        """Velas de 1 minuto con precio medio; el spread real se cobra al ejecutar."""
        q = f"granularity=M1&price=M&count={min(n, 5000)}" + (f"&from={desde}" if desde else "")
        datos = self._pedir("GET", f"/v3/instruments/{instrumento}/candles?{q}")["candles"]
        filas = [{"tiempo": pd.to_datetime(float(v["time"]), unit="s", utc=True), "open": float(v["mid"]["o"]), "high": float(v["mid"]["h"]),
                  "low": float(v["mid"]["l"]), "close": float(v["mid"]["c"]), "volume": float(v["volume"]), "trades": int(v["volume"])}
                 for v in datos if v["complete"]]
        return pd.DataFrame(filas)

    def historico(self, instrumento: str, dias: int = 90) -> pd.DataFrame:
        import time
        desde = time.time() - dias * 86400
        partes = []
        while True:
            df = self.velas(instrumento, 5000, desde)
            if df.empty:
                break
            partes.append(df)
            ultimo = df["tiempo"].iloc[-1].timestamp()
            if ultimo <= desde or len(df) < 100:
                break
            desde = ultimo + 1
        return pd.concat(partes, ignore_index=True).drop_duplicates("tiempo") if partes else pd.DataFrame()

    def precio(self, instrumento: str) -> float:
        p = self._pedir("GET", f"/v3/accounts/{self.cuenta}/pricing?instruments={instrumento}")["prices"][0]
        return (float(p["bids"][0]["price"]) + float(p["asks"][0]["price"])) / 2

    def saldo_usdt(self) -> float:
        return float(self._pedir("GET", f"/v3/accounts/{self.cuenta}/summary")["account"]["marginAvailable"])

    def posicion(self, instrumento: str) -> float:
        for t in self._pedir("GET", f"/v3/accounts/{self.cuenta}/openTrades")["trades"]:
            if t["instrument"] == instrumento:
                return float(t["currentUnits"])
        return 0.0

    def abrir(self, instrumento: str, unidades: int, tp: float, sl: float, decimales: int = 5) -> dict:
        orden = {"order": {"type": "MARKET", "instrument": instrumento, "units": str(unidades), "timeInForce": "FOK",
                           "takeProfitOnFill": {"price": f"{tp:.{decimales}f}"}, "stopLossOnFill": {"price": f"{sl:.{decimales}f}"}}}
        return self._pedir("POST", f"/v3/accounts/{self.cuenta}/orders", orden)

    def cerrar(self, instrumento: str) -> None:
        for t in self._pedir("GET", f"/v3/accounts/{self.cuenta}/openTrades")["trades"]:
            if t["instrument"] == instrumento:
                self._pedir("PUT", f"/v3/accounts/{self.cuenta}/trades/{t['id']}/close", {"units": "ALL"})
