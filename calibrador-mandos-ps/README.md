# Calibrador de mandos PlayStation (drift de sticks)

Web app (PWA, sin instalar nada) que **mide el drift** de los sticks de un DualShock 4 o DualSense y **recalibra el centro y el rango** escribiéndolo en la memoria del propio mando. La corrección queda guardada en el mando, así que vale para PS4, PS5, PC o móvil.

## Lo que hay que saber antes

| Pregunta | Respuesta |
|---|---|
| ¿Funciona por Bluetooth? | **Solo para medir el drift.** El firmware de Sony no acepta los comandos de calibración por Bluetooth, ni aquí ni en ninguna otra herramienta: para calibrar hay que conectar el mando **por cable USB**. |
| ¿Funciona en el celular? | Todavía no. Necesita WebHID, que Chrome para Android tiene previsto activar en la versión 157 (hoy va por la 154-155). Cuando llegue, esta misma página funcionará en Android con un cable USB OTG. En iPhone no hay forma. |
| ¿Dónde funciona hoy? | Chrome, Edge u Opera en Windows, macOS, Linux y ChromeOS. |
| ¿Qué drift arregla? | El desvío constante en reposo (drift leve) y los sticks que no llegan al borde. Si el drift es errático o vuelve a los días, el potenciómetro está gastado: hay que cambiar el módulo. |
| ¿Es seguro? | Usa el mismo protocolo que [dualshock-tools](https://github.com/dualshock-tools/dualshock-tools.github.io) (MIT), con miles de usos. Los cambios son temporales hasta pulsar "Guardar permanente", y "Deshacer" reinicia el mando. Mandos clon: la calibración se desactiva. |

## Uso

1. Abre la página (ver "Publicar") en Chrome y conecta el mando **por USB**.
2. Pulsa **Conectar mando** y elige el DualShock/DualSense.
3. **Medir drift**: suelta los sticks 3 segundos. Te dice el desvío de cada stick, si es leve o fuerte y qué zona muerta poner en los juegos si prefieres no calibrar.
4. **Calibrar centro**: 4 muestras, en cada una mueves los sticks en círculos, los sueltas y pulsas Continuar.
5. **Calibrar rango**: giras los sticks por todo el borde 4 vueltas (15 s) y pulsas Terminar.
6. Vuelve a **Medir drift**. Si está bien, **Guardar permanente**. Si no, **Deshacer**.

## Publicar

Es estático: cualquier hosting con HTTPS sirve (WebHID exige HTTPS o `localhost`).

```bash
cd calibrador-mandos-ps
npx serve .        # http://localhost:3000
```

O GitHub Pages / Netlify / Vercel apuntando a esta carpeta. Al abrirla en Chrome se puede "Instalar" como app (PWA) y funciona sin conexión.

## Estructura

- `index.html`: interfaz en español.
- `js/hid.js`: protocolo WebHID. Clases `DualShock4` y `DualSense` con `centroInicio/centroMuestra/centroFin`, `rangoInicio/rangoFin`, `guardar`, `reiniciar`, detección USB/Bluetooth por el tamaño del informe de entrada (63 bytes = USB, 77 = Bluetooth).
- `js/app.js`: medición de drift (media y ruido en reposo), asistentes de calibración, registro.
- `sw.js`, `manifest.webmanifest`, `icono.svg`: PWA.

## Pendiente / ideas

- Probar con hardware real (esta versión se escribió sin un mando conectado; el protocolo está portado 1:1 del proyecto de referencia).
- DualSense Edge: calibración "fine tune" por eje (el original la tiene; aquí solo centro y rango).
- Cuando Chrome Android 157 salga: comprobar que `navigator.hid` aparece y que el informe USB con cable OTG tiene 63 bytes.
