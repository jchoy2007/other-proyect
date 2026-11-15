import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useVideoConfig } from "remotion";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import { marca } from "./config";
import { FADE } from "./ui";
import {
  Banco, Burocracia, Cierre, Desisten, Entramos, Espera, Experiencia, Gancho, Giro, PaginaWeb, Ventajas, Vision,
} from "./Escenas";

// Orden y duración (en fotogramas, 30 fps) de cada escena
const ESCENAS: { C: React.FC<{ d: number }>; d: number }[] = [
  { C: Gancho, d: 150 },
  { C: Burocracia, d: 125 },
  { C: Espera, d: 125 },
  { C: Banco, d: 125 },
  { C: Desisten, d: 125 },
  { C: Giro, d: 80 },
  { C: Entramos, d: 150 },
  { C: Experiencia, d: 150 },
  { C: Ventajas, d: 160 },
  { C: Vision, d: 262 },
  { C: PaginaWeb, d: 240 },
  { C: Cierre, d: 240 },
];

export const DURACION = ESCENAS.reduce((a, e) => a + e.d, 0) - FADE * (ESCENAS.length - 1);

const useFuentes = () => {
  const [h] = useState(() => delayRender("Cargando fuentes"));
  useEffect(() => {
    Promise.all([500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px Montserrat`)))
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
            interpolate(f, [0, 20, durationInFrames - 60, durationInFrames], [0, 0.9, 0.9, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
