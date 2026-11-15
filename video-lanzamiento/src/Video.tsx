import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useVideoConfig } from "remotion";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/cinzel/700.css";
import { marca } from "./config";
import { FADE } from "./ui";
import {
  Casa, Cierre, DosEmpresas, Familia, Fundadora, Llave, Nace, PaginaWeb, Puertas, Recorrido, Tramite,
} from "./Escenas";

// Orden y duración (en fotogramas, 30 fps) de cada escena
const ESCENAS: { C: React.FC<{ d: number }>; d: number }[] = [
  { C: Familia, d: 165 }, //     0–5 s   Una familia encontró su apartamento
  { C: Tramite, d: 110 }, //    5–8 s   Y entonces empezó el trámite
  { C: Puertas, d: 250 }, //    8–16 s  Cinco puertas… y la venta se cae
  { C: Llave, d: 85 }, //      16–19 s  Una sola llave
  { C: Fundadora, d: 230 }, // 19–26 s  Irisbel Tapia, 25 años
  { C: Nace, d: 120 }, //      26–30 s  Por eso nació HRP
  { C: DosEmpresas, d: 170 }, //30–35 s HRP + CHS
  { C: Recorrido, d: 165 }, // 35–40 s  6 pasos, un solo acompañante
  { C: Casa, d: 150 }, //      40–45 s  Torre BICSA, frente a la bahía
  { C: PaginaWeb, d: 185 }, // 45–51 s  Página web
  { C: Cierre, d: 290 }, //    51–60 s  Logo, slogan y contacto
];

export const DURACION = ESCENAS.reduce((a, e) => a + e.d, 0) - FADE * (ESCENAS.length - 1);

const useFuentes = () => {
  const [h] = useState(() => delayRender("Cargando fuentes"));
  useEffect(() => {
    Promise.all([
      document.fonts.load("700 40px 'Playfair Display'"),
      document.fonts.load("italic 700 40px 'Playfair Display'"),
      ...[400, 500, 600, 700].map((w) => document.fonts.load(`${w} 40px Poppins`)),
      document.fonts.load("700 40px Cinzel"),
    ])
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
};

export const Lanzamiento: React.FC = () => {
  useFuentes();
  const { durationInFrames } = useVideoConfig();
  let desde = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {ESCENAS.map(({ C, d }, i) => {
        const from = desde;
        desde += d - FADE;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <C d={d} />
          </Sequence>
        );
      })}
      {marca.musica ? (
        <Audio
          src={staticFile(marca.musica)}
          volume={(f) =>
            interpolate(f, [0, 20, durationInFrames - 60, durationInFrames], [0, 0.85, 0.85, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
