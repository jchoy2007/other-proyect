# ScalpingDemo para MetaTrader 5

Asesor Experto (EA) con las mismas cuatro estrategias del bot en Python. Corre dentro de MetaTrader 5, conectado a tu bróker, así que usa **los precios, spreads y comisiones reales de esa plataforma**.

## Instalar

1. Abre una cuenta **demo** en un bróker con MetaTrader 5. Casi todos la ofrecen gratis; elige uno regulado (FCA, ASIC, CySEC o el regulador de tu país).
2. En MT5: Archivo → Abrir carpeta de datos → `MQL5/Experts/` y copia `ScalpingDemo.mq5`.
3. Abre MetaEditor (F4), abre el archivo y pulsa Compilar (F7).
4. En MT5 aparecerá en Navegador → Asesores Expertos.

## Probar sin arriesgar nada

1. **Probador de Estrategias** (Ctrl+R): elige `ScalpingDemo`, el símbolo (EURUSD, XAUUSD…), el marco M1, modelado "Cada tick basado en ticks reales" y los últimos 3 meses. Ese modo usa los ticks y spreads reales del bróker.
2. Pestaña "Optimización": puedes dejar que MT5 busque los mejores parámetros. Luego prueba esos parámetros en un periodo **distinto**: si solo gana en el periodo optimizado, no sirve.
3. Si gana en el periodo distinto, arrástralo a un gráfico de la cuenta demo y déjalo semanas.

## Sobre los 5 USD

Con 5 USD, el lote mínimo de 0,01 en EURUSD mueve unos 0,10 USD por pip. Un stop del 0,4% son unos 40 pips, es decir 4 USD: casi toda la cuenta en una sola operación. Algunos brókers tienen **cuentas cent** (saldo en centavos, lote 100 veces más chico) pensadas para cuentas así.
