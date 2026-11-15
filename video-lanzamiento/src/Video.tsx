import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile } from "remotion";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/cinzel/700.css";
import linea from "./linea-tiempo.json";
import {
  Casa, Cierre, DosEmpresas, Equipo, Familia, Llave, Nace, PaginaWeb, Puertas, Recorrido, Tramite,
} from "./Escenas";

/** Momento (en fotogramas, relativo a la escena) en que empieza cada frase del narrador. */
export type PropsEscena = { d: number; voz?: number[] };

const COMPONENTES: Record<string, React.FC<PropsEscena>> = {
  Familia, Tramite, Puertas, Llave, Equipo, Nace, DosEmpresas, Recorrido, Casa, PaginaWeb, Cierre,
};

// Duraciones calculadas por scripts/narracion.py según la voz
export const DURACION = linea.total;

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
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {linea.escenas.map((e) => {
        const C = COMPONENTES[e.id];
        return (
          <Sequence key={e.id} from={e.desde} durationInFrames={e.d}>
            <C d={e.d} voz={e.voces.map((v) => v.inicio)} />
          </Sequence>
        );
      })}
      {/* Música + narración, generadas por scripts/narracion.py y scripts/musica.py */}
      <Audio src={staticFile("audio/mezcla.wav")} />
    </AbsoluteFill>
  );
};
