# Video de lanzamiento · Holding Realty Properties (Remotion)

Video de ~75 s con narrador y música original, en dos formatos:
- `Lanzamiento-Vertical`: 1080x1920 (Reels, TikTok, Stories)
- `Lanzamiento-Horizontal`: 1920x1080 (pantalla del evento, YouTube, web)

## Estructura (v3)
| Escena | Narración |
|---|---|
| Familia | Una familia en Panamá… por fin encontró su apartamento. |
| Trámite | Y entonces, empezó el trámite. |
| Cinco puertas | Promotora, corredor, banco, afianzadora, abogado. Cinco puertas… y el cliente es quien las camina. Un papel vencido, una carta incompleta… y la venta se cae. |
| Llave | Cinco puertas. Una sola llave. |
| Equipo (manos) | Detrás de nosotros, un equipo de liderazgo con más de 25 años de experiencia en el sector bancario, financiero e inmobiliario. Cuando decimos que entendemos al banco, no es un eslogan. Es nuestra historia. |
| Nace | Por eso nació Holding Realty Properties. |
| Dos empresas | Vendemos el inmueble. Y con Corporate Holding Solutions, lo llevamos hasta el desembolso. |
| Recorrido | Un solo acompañante, de la búsqueda… a las llaves. |
| Torre BICSA | Desde la Torre BICSA, frente a la bahía de Panamá. |
| Web | Conoce todos nuestros servicios en holdingrealty punto com. |
| Cierre | Holding Realty Properties. Construyendo juntos un futuro de oportunidades. |

## Audio
1. `python3 scripts/narracion.py`: genera la voz (Piper, `es_MX-claude-high`, en `voces/`) y `src/linea-tiempo.json`; cada escena dura lo que necesita su narración.
2. `python3 scripts/musica.py`: compone la música (suspenso → tensión → golpe grave → esperanza → impacto en el cierre), baja la música cuando habla el narrador y genera `public/audio/mezcla.wav`.

Para cambiar una frase: edita `GUION` en `scripts/narracion.py`, ejecuta los dos scripts y vuelve a renderizar.
Para usar un locutor real: reemplaza los .wav de `public/audio/voz/` (mismos nombres) y ejecuta solo `musica.py`.

## Personalizar
Edita **`src/config.ts`**: textos, contacto, servicios, pasos y música. Los logos oficiales están en `public/logos/` y las fotos de la marca en `public/marca/`.

## Comandos
```bash
npm install
npm run studio            # vista previa interactiva
npm run render            # genera out/lanzamiento-vertical.mp4 y out/lanzamiento-horizontal.mp4
```

## Créditos de imágenes (Wikimedia Commons, licencias CC)
Al publicar, incluye en la descripción: *"Fotos: Wikimedia Commons (CC BY / CC BY-SA)"* con los autores:
- Bahía de noche (`Cinta_Costera_Panama_Agosto20019.jpg`): Ciudad PMA500, CC BY-SA 2.0
- Av. Balboa día / torre (`Avenida_Balboa,_Panama_City_2019-10-23-1/2.jpg`): Alexey Komarov, CC BY-SA 4.0
- Av. Balboa noche (`Foto-Nocturna-Ave-Balboa-Panama-2017-DG.jpg`): Garcia.dennis, CC BY-SA 4.0
- Cinta Costera (`Cinta_Costera_Paitilla1.JPG`): 123Hollic, CC BY-SA 4.0
- Skyline Balboa (`Panama_08_2013_Ave_Balboa_7044.JPG`): Mariordo (Mario Roberto Durán Ortiz), CC BY-SA 3.0
- El Tornillo (`Panama_02_2014_F&F_Tower_7674.JPG`, `F&F_Tower_03_2015_Panama_1331.JPG`): Mariordo, CC BY-SA 3.0 / 4.0
- El Tornillo y ciudad (`F&F_Tower_2012-09-24.jpg`): flam3boy, CC BY-SA 3.0
- Torre BICSA (`BICSA_Financial_Center_03_2015_Panama_1335.JPG`): Mariordo, CC BY-SA 4.0

Las fotos de la oficina provienen de la presentación de la marca.
- Manos (`Business man and woman handshake in work office.jpg`): perzon seo, CC BY 2.0
- Manos (`Handshake - Men - 37969912965.jpg`): amtec_photos, CC BY-SA 2.0
