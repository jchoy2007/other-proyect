"""Binance Futuros USDⓈ-M. Demo oficial: https://testnet.binancefuture.com (claves gratis en esa web).
Real: https://fapi.binance.com. Las órdenes se firman con HMAC-SHA256 (la clave secreta nunca sale de tu equipo)."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import time
import urllib.parse
import urllib.request
from decimal import Decimal, ROUND_DOWN

import pandas as pd

URL = {"demo": "https://testnet.binancefuture.com", "real": "https://fapi.binance.com"}


class BinanceFuturos:
    nombre = "binance_futuros"

    def __init__(self, modo: str = "demo"):
        self.modo = modo
        self.base = URL[modo]
        sufijo = "" if modo == "real" else "_DEMO"
        self.clave = os.environ.get(f"BINANCE_API_KEY{sufijo}", "")
        self.secreto = os.environ.get(f"BINANCE_API_SECRET{sufijo}", "").encode()
        self._reglas: dict = {}

    # ---------- HTTP ----------
    def _pedir(self, metodo: str, ruta: str, params: dict | None = None, firmado: bool = False):
        params = dict(params or {})
        if firmado:
            if not self.clave or not self.secreto:
                raise RuntimeError(f"Faltan BINANCE_API_KEY{'' if self.modo == 'real' else '_DEMO'} y BINANCE_API_SECRET{'' if self.modo == 'real' else '_DEMO'}")
            params["timestamp"] = int(time.time() * 1000)
            params["recvWindow"] = 5000
            q = urllib.parse.urlencode(params)
            params["signature"] = hmac.new(self.secreto, q.encode(), hashlib.sha256).hexdigest()
        q = urllib.parse.urlencode(params)
        url = f"{self.base}{ruta}" + (f"?{q}" if q else "")
        req = urllib.request.Request(url, method=metodo, headers={"X-MBX-APIKEY": self.clave} if self.clave else {})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"Binance {e.code}: {e.read().decode()[:300]}") from None

    # ---------- Mercado ----------
    def velas(self, simbolo: str, n: int = 300) -> pd.DataFrame:
        datos = self._pedir("GET", "/fapi/v1/klines", {"symbol": simbolo, "interval": "1m", "limit": n})
        df = pd.DataFrame(datos, columns=["t", "open", "high", "low", "close", "volume", "ct", "qv", "trades", "tb", "tq", "x"])
        df["tiempo"] = pd.to_datetime(df["t"], unit="ms", utc=True)
        df = df[["tiempo", "open", "high", "low", "close", "volume", "trades", "ct"]].astype(
            {"open": float, "high": float, "low": float, "close": float, "volume": float, "trades": int})
        # Quitar la vela que todavía no ha cerrado
        return df[df["ct"] < time.time() * 1000].drop(columns="ct").reset_index(drop=True)

    def precio(self, simbolo: str) -> float:
        return float(self._pedir("GET", "/fapi/v1/ticker/price", {"symbol": simbolo})["price"])

    def reglas(self, simbolo: str) -> dict:
        if simbolo not in self._reglas:
            info = self._pedir("GET", "/fapi/v1/exchangeInfo")
            for s in info["symbols"]:
                f = {x["filterType"]: x for x in s["filters"]}
                self._reglas[s["symbol"]] = {
                    "paso": Decimal(f["MARKET_LOT_SIZE"]["stepSize"]),
                    "min_cant": Decimal(f["MARKET_LOT_SIZE"]["minQty"]),
                    "min_nocional": float(f.get("MIN_NOTIONAL", {}).get("notional", 5)),
                    "tick": Decimal(f["PRICE_FILTER"]["tickSize"]),
                }
        return self._reglas[simbolo]

    # ---------- Cuenta y órdenes ----------
    def saldo_usdt(self) -> float:
        for a in self._pedir("GET", "/fapi/v2/balance", firmado=True):
            if a["asset"] == "USDT":
                return float(a["availableBalance"])
        return 0.0

    def apalancamiento(self, simbolo: str, x: int) -> None:
        self._pedir("POST", "/fapi/v1/leverage", {"symbol": simbolo, "leverage": x}, firmado=True)

    def posicion(self, simbolo: str) -> float:
        for p in self._pedir("GET", "/fapi/v2/positionRisk", {"symbol": simbolo}, firmado=True):
            return float(p["positionAmt"])
        return 0.0

    def cantidad(self, simbolo: str, nocional_usdt: float, precio: float) -> str:
        r = self.reglas(simbolo)
        cant = (Decimal(str(nocional_usdt)) / Decimal(str(precio))).quantize(r["paso"], rounding=ROUND_DOWN)
        if float(cant) * precio < r["min_nocional"] <= nocional_usdt * 1.02:
            cant += r["paso"]  # redondear un paso hacia arriba para no quedar por debajo del mínimo
        if cant < r["min_cant"] or float(cant) * precio < r["min_nocional"]:
            raise ValueError(f"{simbolo}: {nocional_usdt:.2f} USDT no llega al mínimo de la plataforma ({r['min_nocional']} USDT)")
        return format(cant.normalize(), "f")

    def orden_mercado(self, simbolo: str, lado: str, cantidad: str, solo_reducir: bool = False) -> dict:
        p = {"symbol": simbolo, "side": lado, "type": "MARKET", "quantity": cantidad, "newOrderRespType": "RESULT"}
        if solo_reducir:
            p["reduceOnly"] = "true"
        return self._pedir("POST", "/fapi/v1/order", p, firmado=True)

    def orden_limite_salida(self, simbolo: str, lado: str, cantidad: str, precio: float) -> dict:
        """Objetivo de ganancia como orden límite post-only (paga comisión de maker)."""
        tick = self.reglas(simbolo)["tick"]
        px = format((Decimal(str(precio)) / tick).quantize(Decimal(1), rounding=ROUND_DOWN) * tick, "f")
        return self._pedir("POST", "/fapi/v1/order", {"symbol": simbolo, "side": lado, "type": "LIMIT", "timeInForce": "GTX",
                                                         "quantity": cantidad, "price": px, "reduceOnly": "true"}, firmado=True)

    def cancelar_todo(self, simbolo: str) -> None:
        self._pedir("DELETE", "/fapi/v1/allOpenOrders", {"symbol": simbolo}, firmado=True)
