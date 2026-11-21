# Alertas de bajadas de precio (Amazon US y Newegg US)

Avisos al teléfono cuando un producto de Amazon o Newegg baja de precio de golpe o alguien reporta un **error de precio**. Funciona como las cuentas de X que publican "price error" y "price drop".

## Qué vigila

| Modo | Fuente | Qué detecta | Funciona desde |
|---|---|---|---|
| Descubrir | Slickdeals (portada, populares, búsquedas "price error") | Ofertas de Amazon/Newegg con ≥50% de descuento o reportadas como error de precio | Cualquier lugar, incluido GitHub Actions |
| Descubrir | Reddit r/buildapcsales y r/deals | Lo mismo; r/buildapcsales es donde más se publican errores de Newegg | Tu PC (Reddit bloquea servidores) |
| Descubrir | Keepa Deals (opcional, de pago) | Caídas de precio en **todo** Amazon US frente a su promedio: lo que usan las cuentas de "price error" | Cualquier lugar |
| Vigilar | Tu lista de productos | Baja de tu precio objetivo, cae X% o marca mínimo histórico | Tu PC; con Keepa, también en la nube para Amazon |

Cada oferta se avisa una sola vez. La primera ejecución memoriza lo que ya hay publicado sin avisar, para no mandarte 50 notificaciones de golpe.

## 1. Recibir los avisos en el teléfono (2 minutos)

1. Instala **ntfy** (gratis, sin cuenta): Android en Google Play / F-Droid, iPhone en App Store.
2. Pulsa **+** y suscríbete a tu tema privado. Es el valor `ntfy_topic` de `config.json`; elige uno difícil de adivinar, porque quien conozca el nombre puede leer los avisos.
3. Prueba: `python alertas.py prueba`.

Los errores de precio llegan con prioridad máxima, que suena aunque el teléfono esté en silencio si así lo configuras en ntfy. Las caídas de 70% o más llegan con prioridad alta.

## 2. Configurar

Copia `config.ejemplo.json` a `config.json` y cambia lo que quieras:

- `descuento_minimo`: % mínimo para avisar (50 por defecto).
- `precio_minimo`: ignora cosas de menos de X dólares (15 por defecto).
- `palabras_clave`: si pones `["rtx", "ssd", "ps5"]`, solo avisa de eso, salvo errores de precio, que siempre avisa.
- `productos`: tu lista personal, con `precio_objetivo` y `caida_pct`.

## 3. Dejarlo corriendo

**En tu PC (recomendado para la lista personal y Reddit):**

```bash
python alertas.py todo --bucle 300      # revisa cada 5 minutos
```

En Windows puedes crear una tarea en el Programador de tareas que ejecute `python alertas.py todo` cada 5 minutos.

**En la nube, gratis, con GitHub Actions:** el workflow `.github/workflows/alertas-precios.yml` lo corre cada 10 minutos. Agrega en GitHub → Settings → Secrets and variables → Actions:

- `NTFY_TOPIC`: tu tema de ntfy.
- `KEEPA_KEY` (opcional): activa el descubrimiento en todo Amazon y la lista personal de Amazon desde la nube.

GitHub solo ejecuta workflows programados que estén en la **rama principal** del repositorio: hay que fusionar esta rama primero.

## Keepa (opcional, pero es lo que usan las cuentas grandes)

Keepa rastrea el historial de precio de millones de productos de Amazon. Su API de pago (desde unos 19 €/mes) permite pedir "todo lo que cayó más de 50% hoy". Crea la clave en keepa.com → API y ponla en `KEEPA_KEY`. Sin Keepa, el monitor depende de que alguien publique la oferta en Slickdeals o Reddit, normalmente minutos después de que aparece.

## Límites honestos

- Amazon y Newegg bloquean consultas automáticas desde servidores en la nube. Desde una conexión de casa funcionan, pero si consultas demasiado seguido pueden pedir captcha. Por eso el monitor espera 3 segundos entre productos.
- Los errores de precio se corrigen en minutos y la tienda puede cancelar el pedido. Compra rápido, pero no cuentes con que siempre te lo respeten.
