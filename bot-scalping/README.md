# Bot de scalping (cripto, futuros y divisas)

Bot que prueba estrategias de scalping con datos reales, las "entrena" optimizando parámetros y las valida en días que nunca vio. Luego las ejecuta en la **cuenta demo oficial** de la plataforma, con el mismo código que usaría una cuenta real.

> **Lee esto primero.** El resultado honesto de las pruebas está en `resultados/informe.md`. Resumen: con las comisiones reales, ninguna estrategia de scalping probada gana de forma fiable. Convertir 5 USD en 5.000 no es posible con trading; perderlos sí es lo más probable.

## Plataformas

| Plataforma | Mercado | Demo oficial | Mínimo por orden | ¿Sirve con 5 USD? |
|---|---|---|---|---|
| Binance Futuros (USDⓈ-M) | Futuros perpetuos cripto, permite cortos | testnet.binancefuture.com | 5 USDT (DOGE, SOL); 20 ETH; 50 BTC | Solo DOGE/SOL, con 2x de apalancamiento para pasar el mínimo |
| Binance Spot | Cripto al contado | testnet.binance.vision | 5 USDT (BTC, ETH, SOL); 1 USDT (DOGE) | Solo DOGE; en BTC no podrías vender si baja un centavo |
| OANDA | Divisas, oro, índices (CFD) | api-fxpractice.oanda.com | 1 unidad | Sí, con apalancamiento (cada pip vale centavos) |
| Futuros de bolsa (CME: micro S&P, oro…) | Futuros regulados | Brokers como NinjaTrader/Tradovate | Garantía de 50 a 2.000+ USD por contrato | No |
| Acciones (Alpaca) | Bolsa EE.UU. | paper-api.alpaca.markets | Fracciones desde 1 USD | Técnicamente, pero el scalping en acciones tiene reglas de "day trading" que lo limitan con cuentas pequeñas |

## Archivos

- `datos.py`: descarga velas de 1 minuto de Binance (spot y futuros) desde sus archivos públicos.
- `indicadores.py`: EMA, RSI, ATR, Bollinger, VWAP y variables para el modelo.
- `estrategias.py`: 4 estrategias (cruce de EMAs, rebote en Bollinger, ruptura con volumen, reversión a VWAP) y su rejilla de parámetros.
- `backtest.py`: simulador con objetivo, stop, salida por tiempo, comisiones reales de Binance y deslizamiento. Si objetivo y stop caen en la misma vela, asume lo peor.
- `entrenar.py`: optimiza en 60 días, evalúa en los ~30 siguientes y entrena un modelo de gradient boosting con la misma separación. Escribe `resultados/`.
- `experimento_99.py`: demuestra por qué un 95-99% de aciertos puede perder dinero.
- `plataformas/`: conectores a Binance Futuros y OANDA (demo y real).
- `operar.py`: ejecuta una estrategia en la plataforma y deja un registro CSV de cada operación en `registro/`.

## Uso

```bash
cd bot-scalping
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python datos.py                # spot
.venv/bin/python datos.py --futuros      # futuros
.venv/bin/python entrenar.py             # ~20-40 min con 4 núcleos
.venv/bin/python experimento_99.py
```

### Operar en la demo de Binance Futuros

1. Entra a testnet.binancefuture.com con tu cuenta de Binance y genera una clave API de prueba (da saldo ficticio).
2. En tu equipo, no en el chat:
   ```bash
   export BINANCE_API_KEY_DEMO=...
   export BINANCE_API_SECRET_DEMO=...
   .venv/bin/python operar.py --plataforma binance --simbolo DOGEUSDT --config resultados/config_demo.json --capital 5 --apalancamiento 2 --minutos 240
   ```
   Importante: el testnet tiene su propio libro de órdenes con poca liquidez, y sus precios no siempre coinciden con el mercado real. Sirve para comprobar que el bot funciona, no para medir si gana.

### Operar en la demo de OANDA (divisas)

Crea una cuenta de práctica en oanda.com y genera un token en "Manage API Access".

```bash
export OANDA_TOKEN_DEMO=...
.venv/bin/python operar.py --plataforma oanda --simbolo EUR_USD --config resultados/config_demo.json --capital 5 --apalancamiento 20 --minutos 240
```

### Pasar a dinero real

Solo cuando una estrategia haya ganado en la prueba fuera de muestra **y** en semanas de demo.

- Crea una clave API real **sin permiso de retiro**, y limitada a tu IP si la plataforma lo permite.
- Cambia las variables a `BINANCE_API_KEY` / `BINANCE_API_SECRET` (o `OANDA_TOKEN`).
- Ejecuta con `--real --confirmo "puedo perder todo este dinero"`. Por defecto el bot para de abrir operaciones si pierde el 20% del capital en un día (`--perdida-max-dia`).
- El stop en Binance lo vigila el bot cada 5 segundos. Si el bot se cae con una posición abierta, la posición queda sin stop. Ejecútalo en un equipo o servidor que no se apague.
