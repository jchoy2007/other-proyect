"""¿Se puede acertar el 99% de las veces? Sí: objetivo minúsculo y stop enorme. ¿Gana dinero? Este script lo mide."""
from __future__ import annotations

import numpy as np

from backtest import COSTOS, simular
from datos import cargar

print(f"{'Par':<9} {'Objetivo':>8} {'Stop':>6} {'Ops':>5} {'Aciertos':>9} {'Resultado':>10} {'Peor op.':>9}  Con 5 USD y 5x")
for simbolo in ("BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"):
    df = cargar(simbolo, mercado="futuros")
    o, h, l, c = (df[k].to_numpy() for k in ("open", "high", "low", "close"))
    senal = np.zeros(len(df), dtype=np.int8)
    senal[::30] = 1  # comprar cada 30 minutos, sin pensar: lo que importa es el objetivo/stop
    for tp, sl in ((0.003, 0.05), (0.002, 0.10)):
        r = simular(o, h, l, c, senal, tp, sl, 60 * 24 * 7, COSTOS["futuros"])
        capital = 5.0
        for x in r.rets:  # con apalancamiento 5x un -20% liquida la cuenta
            capital *= max(0.0, 1 + 5 * x)
            if capital <= 0.01:
                capital = 0.0
                break
        print(f"{simbolo:<9} {tp:>8.1%} {sl:>6.0%} {r.operaciones:>5} {r.aciertos:>8.1f}% {r.retorno_total:>+9.1f}% {r.rets.min():>+8.1%}  {capital:>6.2f} USD")
