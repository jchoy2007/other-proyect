"""¿Se pueden convertir 5 USD en 1.000 reinvirtiendo cada ganancia ("escalado")?
Simula 10.000 cuentas que operan en futuros con apalancamiento y reinvierten todo, para distintas tasas de acierto."""
from __future__ import annotations

import numpy as np

rng = np.random.default_rng(7)
CUENTAS, MAX_OPS = 10_000, 5_000
TP = SL = 0.004            # objetivo y stop del 0,4% (típico de scalping)
COM_GANA = 0.0005 + 0.0002  # entra a mercado, sale con límite
COM_PIERDE = 0.0005 + 0.0005
INICIO, META, QUIEBRA = 5.0, 1000.0, 0.5  # por debajo de 0,5 USD ya no llegas al mínimo de 5 USD ni con 10x

print(f"{'Aciertos':>8} {'Apal.':>5} {'Llegan a 1.000':>15} {'Quiebran':>9} {'Mediana final':>14}")
for apal in (5, 10, 20):
    gana = 1 + apal * (TP - COM_GANA)
    pierde = 1 - apal * (SL + COM_PIERDE)
    for p in (0.50, 0.52, 0.55, 0.60):
        capital = np.full(CUENTAS, INICIO)
        activa = np.ones(CUENTAS, bool)
        llego = np.zeros(CUENTAS, bool)
        for _ in range(MAX_OPS):
            if not activa.any():
                break
            exito = rng.random(CUENTAS) < p
            capital = np.where(activa, capital * np.where(exito, gana, pierde), capital)
            llego |= activa & (capital >= META)
            activa &= (capital < META) & (capital > QUIEBRA)
        quiebra = (capital <= QUIEBRA).mean()
        print(f"{p:>8.0%} {apal:>4}x {llego.mean():>14.2%} {quiebra:>9.1%} {np.median(capital):>13.2f}")
