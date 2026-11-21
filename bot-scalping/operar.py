"""Ejecuta una estrategia en una plataforma real, en su cuenta DEMO oficial (por defecto) o en la REAL.

Ejemplos:
  python operar.py --plataforma binance --simbolo DOGEUSDT --config resultados/config_demo.json --capital 5 --apalancamiento 2
  python operar.py --plataforma oanda --simbolo EUR_USD --config resultados/config_demo.json --capital 5 --apalancamiento 20

Seguridad:
  - Sin --real siempre usa la cuenta demo.
  - --real exige además --confirmo "puedo perder todo este dinero".
  - Se detiene solo si la pérdida del día supera --perdida-max-dia (% del capital).
  - La clave de la API NUNCA debe tener permiso de retiro.
"""
from __future__ import annotations

import argparse
import csv
import json
import signal
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from estrategias import senales
from indicadores import variables_modelo  # noqa: F401  (disponible para estrategias basadas en modelo)

RAIZ = Path(__file__).resolve().parent
CONFIRMACION = "puedo perder todo este dinero"


def ahora() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def log(msg: str) -> None:
    print(f"[{ahora()}] {msg}", flush=True)


def crear_plataforma(nombre: str, modo: str):
    if nombre == "binance":
        from plataformas.binance_futuros import BinanceFuturos
        return BinanceFuturos(modo)
    if nombre == "oanda":
        from plataformas.oanda import Oanda
        return Oanda(modo)
    raise SystemExit(f"Plataforma desconocida: {nombre}")


class Operador:
    def __init__(self, a: argparse.Namespace):
        self.a = a
        self.modo = "real" if a.real else "demo"
        self.p = crear_plataforma(a.plataforma, self.modo)
        cfg = json.loads(Path(a.config).read_text()) if a.config else {}
        self.estrategia = a.estrategia or cfg["estrategia"]
        self.params = json.loads(a.params) if a.params else cfg.get("params", {})
        self.tp = a.tp if a.tp is not None else cfg["tp"]
        self.sl = a.sl if a.sl is not None else cfg["sl"]
        self.max_barras = a.max_barras or cfg["max_barras"]
        self.cortos = True
        self.pos = None  # dict con lado, cantidad, entrada, barra, tp, sl
        self.pnl_dia = 0.0
        self.dia = datetime.now(timezone.utc).date()
        self.registro = RAIZ / "registro" / f"{self.modo}-{a.plataforma}-{a.simbolo}-{datetime.now(timezone.utc):%Y%m%d-%H%M}.csv"
        self.registro.parent.mkdir(exist_ok=True)
        with self.registro.open("w", newline="") as f:
            csv.writer(f).writerow(["abre", "cierra", "lado", "cantidad", "entrada", "salida", "motivo", "resultado_usdt", "resultado_pct"])

    # ---------- utilidades ----------
    def anotar(self, salida: float, motivo: str) -> None:
        pos = self.pos
        d = 1 if pos["lado"] == "BUY" else -1
        pct = d * (salida / pos["entrada"] - 1)
        usdt = pct * pos["nocional"] - pos["nocional"] * (0.0005 + (0.0002 if motivo == "objetivo" else 0.0005))
        self.pnl_dia += usdt
        with self.registro.open("a", newline="") as f:
            csv.writer(f).writerow([pos["abre"], ahora(), pos["lado"], pos["cantidad"], pos["entrada"], salida, motivo, round(usdt, 5), round(pct * 100, 4)])
        log(f"CIERRE {pos['lado']} {motivo}: {pos['entrada']} → {salida} = {usdt:+.4f} USDT (día: {self.pnl_dia:+.4f})")
        self.pos = None

    def abrir(self, d: int, precio: float) -> None:
        lado = "BUY" if d > 0 else "SELL"
        nocional = self.a.capital * self.a.apalancamiento
        if self.a.plataforma == "binance":
            cant = self.p.cantidad(self.a.simbolo, nocional, precio)
            r = self.p.orden_mercado(self.a.simbolo, lado, cant)
            entrada = float(r.get("avgPrice") or precio)
            tp = entrada * (1 + self.tp * d)
            sl = entrada * (1 - self.sl * d)
            try:
                self.p.orden_limite_salida(self.a.simbolo, "SELL" if d > 0 else "BUY", cant, tp)
            except RuntimeError as e:
                log(f"No se pudo poner el objetivo límite ({e}); se cerrará a mercado")
        else:  # oanda: unidades enteras, TP y SL quedan en el servidor
            cant = str(int(nocional / precio) * d)
            entrada = precio
            tp = entrada * (1 + self.tp * d)
            sl = entrada * (1 - self.sl * d)
            self.p.abrir(self.a.simbolo, int(cant), tp, sl, self.a.decimales)
        self.pos = {"lado": lado, "cantidad": cant, "entrada": entrada, "tp": tp, "sl": sl, "barras": 0, "abre": ahora(), "nocional": nocional}
        log(f"ABRE {lado} {cant} {self.a.simbolo} a {entrada} (objetivo {tp:.6g}, stop {sl:.6g}, nocional {nocional:.2f})")

    def cerrar_mercado(self, motivo: str) -> None:
        precio = self.p.precio(self.a.simbolo)
        if self.a.plataforma == "binance":
            self.p.cancelar_todo(self.a.simbolo)
            cant_real = abs(self.p.posicion(self.a.simbolo))
            if cant_real > 0:
                r = self.p.orden_mercado(self.a.simbolo, "SELL" if self.pos["lado"] == "BUY" else "BUY", self.pos["cantidad"], solo_reducir=True)
                precio = float(r.get("avgPrice") or precio)
        else:
            self.p.cerrar(self.a.simbolo)
        self.anotar(precio, motivo)

    # ---------- ciclo ----------
    def vigilar(self) -> None:
        """Cada pocos segundos: ¿se llenó el objetivo? ¿tocó el stop?"""
        if not self.pos:
            return
        restante = self.p.posicion(self.a.simbolo)
        if restante == 0:
            self.anotar(self.pos["tp"] if self.a.plataforma == "binance" else self.p.precio(self.a.simbolo), "objetivo" if self.a.plataforma == "binance" else "servidor")
            return
        precio = self.p.precio(self.a.simbolo)
        d = 1 if self.pos["lado"] == "BUY" else -1
        if (precio - self.pos["sl"]) * d <= 0:
            self.cerrar_mercado("stop")

    def nueva_vela(self) -> None:
        if datetime.now(timezone.utc).date() != self.dia:
            self.dia, self.pnl_dia = datetime.now(timezone.utc).date(), 0.0
        if self.pos:
            self.pos["barras"] += 1
            if self.pos["barras"] >= self.max_barras:
                self.cerrar_mercado("tiempo")
            return
        if self.pnl_dia <= -self.a.capital * self.a.perdida_max_dia / 100:
            log("Límite de pérdida diaria alcanzado: sin nuevas operaciones hasta mañana.")
            return
        df = self.p.velas(self.a.simbolo, 400)
        s = senales(self.estrategia, df, self.params, self.cortos)
        if s[-1] != 0:
            self.abrir(int(s[-1]), float(df["close"].iloc[-1]))

    def correr(self) -> None:
        log(f"Modo {self.modo.upper()} · {self.a.plataforma} · {self.a.simbolo} · {self.estrategia} {self.params} · TP {self.tp:.2%} SL {self.sl:.2%} máx {self.max_barras} min · registro {self.registro.name}")
        fin = time.time() + self.a.minutos * 60 if self.a.minutos else float("inf")
        minuto_previo = None
        while time.time() < fin:
            try:
                m = int(time.time() // 60)
                if m != minuto_previo and time.time() % 60 > 2:
                    minuto_previo = m
                    self.nueva_vela()
                self.vigilar()
            except Exception as e:  # la red falla a veces: registrar y seguir
                log(f"Error: {e}")
            time.sleep(5)
        if self.pos:
            self.cerrar_mercado("fin")
        log(f"Fin. Resultado de la sesión: {self.pnl_dia:+.4f} USDT. Registro: {self.registro}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--plataforma", choices=["binance", "oanda"], required=True)
    ap.add_argument("--simbolo", required=True)
    ap.add_argument("--config", help="JSON con estrategia, params, tp, sl, max_barras")
    ap.add_argument("--estrategia")
    ap.add_argument("--params")
    ap.add_argument("--tp", type=float)
    ap.add_argument("--sl", type=float)
    ap.add_argument("--max-barras", type=int)
    ap.add_argument("--capital", type=float, default=5.0)
    ap.add_argument("--apalancamiento", type=int, default=1)
    ap.add_argument("--perdida-max-dia", type=float, default=20.0)
    ap.add_argument("--minutos", type=float, default=0, help="0 = sin límite")
    ap.add_argument("--decimales", type=int, default=5, help="decimales de precio en OANDA (3 para pares con JPY)")
    ap.add_argument("--real", action="store_true")
    ap.add_argument("--confirmo", default="")
    a = ap.parse_args()
    if a.real and a.confirmo != CONFIRMACION:
        sys.exit(f'Para operar con dinero real añade: --confirmo "{CONFIRMACION}"')
    op = Operador(a)
    if a.plataforma == "binance" and a.apalancamiento > 1:
        op.p.apalancamiento(a.simbolo, a.apalancamiento)
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        op.correr()
    except KeyboardInterrupt:
        if op.pos:
            op.cerrar_mercado("detenido")
        log("Detenido.")


if __name__ == "__main__":
    main()
