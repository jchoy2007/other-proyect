# Resultados del entrenamiento

Datos: velas de 1 minuto de Binance, del 23 de agosto al 19-20 de noviembre de 2026. Entrenamiento: primeros 60 días. Prueba: los días siguientes, que el optimizador nunca vio.
Comisiones: spot 0,10% por lado; futuros 0,05% a mercado y 0,02% con orden límite; deslizamiento 0,01%. Apalancamiento 1x (los % se multiplican con apalancamiento, las pérdidas también).

## Reglas: la mejor configuración del entrenamiento, evaluada en la prueba

| Mercado | Par | Estrategia | Combinaciones rentables en entreno | Entreno | Prueba | Prueba sin comisiones | Ops prueba | Aciertos | Factor de beneficio |
|---|---|---|---|---|---|---|---|---|---|
| futuros | ETHUSDT | rebote_bollinger | 0/900 | -20.2% | -10.8% | +4.1% | 153 | 54% | 0.68 |
| futuros | SOLUSDT | rebote_bollinger | 0/900 | -22.7% | -12.5% | -1.0% | 119 | 46% | 0.62 |
| futuros | DOGEUSDT | rebote_bollinger | 0/900 | -22.3% | -14.6% | -0.6% | 137 | 23% | 0.43 |
| futuros | BTCUSDT | rebote_bollinger | 0/900 | -25.8% | -16.2% | -0.5% | 146 | 41% | 0.44 |
| futuros | SOLUSDT | reversion_vwap | 0/675 | -31.3% | -16.4% | +15.0% | 285 | 47% | 0.81 |
| spot | SOLUSDT | rebote_bollinger | 0/900 | -20.4% | -17.7% | -3.5% | 68 | 32% | 0.27 |
| spot | DOGEUSDT | rebote_bollinger | 0/900 | -26.4% | -18.2% | -4.3% | 76 | 0% | 0.00 |
| futuros | ETHUSDT | reversion_vwap | 0/675 | -28.6% | -19.3% | +3.2% | 258 | 62% | 0.69 |
| futuros | DOGEUSDT | reversion_vwap | 0/675 | -29.9% | -19.8% | +11.0% | 299 | 54% | 0.75 |
| spot | ETHUSDT | rebote_bollinger | 0/900 | -26.6% | -20.2% | -1.8% | 97 | 36% | 0.22 |
| spot | BTCUSDT | rebote_bollinger | 0/900 | -25.2% | -20.8% | -4.1% | 88 | 22% | 0.17 |
| futuros | BTCUSDT | reversion_vwap | 0/675 | -24.0% | -22.6% | +2.9% | 252 | 44% | 0.58 |
| spot | SOLUSDT | ruptura | 0/675 | -48.5% | -24.7% | -3.0% | 115 | 24% | 0.22 |
| spot | DOGEUSDT | ruptura | 0/675 | -42.4% | -24.7% | -5.3% | 104 | 22% | 0.26 |
| spot | BTCUSDT | ruptura | 0/675 | -41.2% | -25.1% | -5.9% | 104 | 18% | 0.11 |
| futuros | SOLUSDT | ruptura | 0/675 | -48.7% | -30.1% | +3.4% | 357 | 32% | 0.53 |
| spot | BTCUSDT | reversion_vwap | 0/675 | -22.2% | -31.1% | -7.1% | 138 | 34% | 0.31 |
| spot | ETHUSDT | reversion_vwap | 0/675 | -33.8% | -33.0% | -6.2% | 160 | 46% | 0.40 |
| spot | SOLUSDT | reversion_vwap | 0/675 | -22.8% | -34.8% | -9.6% | 148 | 36% | 0.42 |
| spot | DOGEUSDT | reversion_vwap | 0/675 | -30.3% | -35.5% | -7.4% | 169 | 35% | 0.42 |
| spot | ETHUSDT | ruptura | 0/675 | -52.1% | -37.2% | -16.2% | 131 | 21% | 0.18 |
| futuros | DOGEUSDT | ruptura | 0/675 | -43.6% | -38.1% | -2.3% | 379 | 32% | 0.59 |
| futuros | BTCUSDT | ruptura | 0/675 | -59.5% | -38.9% | -8.5% | 397 | 46% | 0.39 |
| futuros | ETHUSDT | ruptura | 0/675 | -47.3% | -40.2% | -11.7% | 347 | 32% | 0.54 |
| futuros | BTCUSDT | cruce_ema | 0/675 | -58.5% | -40.9% | -5.8% | 482 | 59% | 0.30 |
| futuros | DOGEUSDT | cruce_ema | 0/675 | -57.4% | -48.5% | -10.6% | 506 | 41% | 0.54 |
| futuros | ETHUSDT | cruce_ema | 0/675 | -60.9% | -52.8% | -16.9% | 539 | 44% | 0.45 |
| futuros | SOLUSDT | cruce_ema | 0/675 | -52.9% | -53.7% | -18.0% | 597 | 61% | 0.45 |
| spot | BTCUSDT | cruce_ema | 0/675 | -79.3% | -56.6% | -7.9% | 343 | 25% | 0.15 |
| spot | ETHUSDT | cruce_ema | 0/675 | -79.6% | -58.1% | -7.0% | 362 | 29% | 0.27 |
| spot | SOLUSDT | cruce_ema | 0/675 | -81.0% | -58.1% | -9.5% | 351 | 31% | 0.34 |
| spot | DOGEUSDT | cruce_ema | 0/675 | -84.0% | -61.4% | -12.9% | 378 | 33% | 0.30 |

**Positivas en la prueba: 0 de 32.**

## Modelo de aprendizaje automático (gradient boosting, futuros)

| Par | Umbral | Validación | Prueba | Prueba sin comisiones | Ops prueba | Aciertos |
|---|---|---|---|---|---|---|
| BTCUSDT | 0.55 | +1.8% | -28.1% | -4.1% | 257 | 36% |
| ETHUSDT | 0.65 | +2.1% | -22.4% | -3.3% | 223 | 43% |
| SOLUSDT | 0.75 | -7.2% | -4.7% | +0.8% | 60 | 45% |
| DOGEUSDT | 0.75 | -3.0% | -4.8% | +0.6% | 64 | 45% |

## Configuración enviada a la demo

`{"estrategia": "rebote_bollinger", "params": {"n": 20, "k": 3.0, "rsi_lim": 20}, "tp": 0.006, "sl": 0.0015, "max_barras": 60, "simbolo": "DOGEUSDT", "mercado": "futuros", "resultado_prueba_pct": -14.565}`

Elegida por su resultado en entrenamiento entre los pares que admiten 5 USD. Su resultado en la prueba indica qué esperar.

## Escenario de comisiones bajas (re-optimizado)

Mismas pruebas para las dos estrategias más prometedoras (reversión a VWAP y rebote en Bollinger), pero pagando solo comisión de orden límite (0,02%) o **cero** en las órdenes límite (supuesto optimista, plataformas con promociones de 0%):

- Con 0,02% (Binance con órdenes límite): **0 de 12.600** combinaciones ganan en entrenamiento; todas pierden en prueba (-4,5% a -20,5%).
- Con comisión cero: en entrenamiento ganan entre +8% y +29%, pero en la prueba caen a entre -22,5% y +6,9%. El mejor caso fue DOGE con rebote en Bollinger (+6,9% en un mes, 1x). Es el patrón clásico de sobreajuste: lo que funcionó en el pasado no se repite.

## ¿Acertar el 99%? (`experimento_99.txt`)

Objetivo minúsculo y stop enorme: se acierta entre el 91% y el 97% de las veces y aun así se pierde entre 25% y 54%. Con 5 USD y 5x, la cuenta termina entre 0,01 y 0,77 USD.

## ¿Escalar de 5 a 1.000 reinvirtiendo? (`experimento_escalado.txt`)

10.000 cuentas simuladas con objetivo y stop del 0,4% y comisiones de futuros. Hasta con 60% de aciertos, como mucho el 0,27% llega a 1.000 USD y entre el 41% y el 100% quiebra. La comisión es ~20% del movimiento: para no perder hace falta acertar más del 60% de forma sostenida, algo que ninguna estrategia probada logró.

## Conclusión

Con datos reales de 90 días, comisiones reales y validación honesta, **no apareció ninguna estrategia de scalping con ventaja positiva**. Reinvertir solo acelera el resultado: con ventaja negativa, acelera la quiebra.

## Búsqueda masiva: 1.000.000 de estrategias (`busqueda_masiva.py`)

Un año de futuros (nov 2025 - nov 2026), 6 criptomonedas, marcos de 1 minuto a 4 horas, 1 a 3 condiciones combinadas de entre ~90 posibles, salidas en múltiplos de ATR. Etapas separadas: búsqueda (60%), validación (20%) y prueba final (20%). Control: 200.000 estrategias con **entradas al azar**.

| Etapa | Estrategias | Entradas al azar |
|---|---|---|
| Pasan búsqueda | 3,5% | 3,9% |
| Pasan validación | 0,51% | 0,84% |
| De esas, positivas en la prueba final | 45% | 49% |

Las estrategias no superan al azar. Las "ganadoras" son casi todas ventas en corto de DOGE y XRP porque ese año todo el mercado cayó (DOGE -51% y -36% en búsqueda y prueba).

- **Contra copias al azar** (`analisis_ganadoras.py`): las 10 mejores, comparadas con 1.000 copias con entradas al azar y las mismas salidas, quedan en promedio a mitad de tabla (entre el percentil 0,3 y el 94).
- **Año anterior, nunca visto** (`prueba_anio_anterior.py`): las 10 mejores pierden todas, entre -5% y -65%, con caídas máximas de 42% a 71%.

El Monte Carlo que parece llevar 10 USD a 1.000 solo repite las operaciones de un año bajista: asume que el mercado seguirá cayendo igual durante años.
