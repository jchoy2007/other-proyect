import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { colores } from "./config";

export const FUENTE = "'Playfair Display', Georgia, serif";
export const SANS = "'Poppins', sans-serif";
export const CINZEL = "'Cinzel', serif";
export const FADE = 12;

/** Unidad de escala: 1 = 1px en un lienzo de 1080 de lado corto. */
export const useU = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 1080;
};

export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** Contenedor de escena con fundido de entrada y salida. */
export const Escena: React.FC<{
  duracion: number;
  children: React.ReactNode;
  fadeIn?: boolean;
  fadeOut?: boolean;
}> = ({ duracion, children, fadeIn = true, fadeOut = true }) => {
  const f = useCurrentFrame();
  const a = fadeIn ? interpolate(f, [0, FADE], [0, 1], { extrapolateRight: "clamp" }) : 1;
  const b = fadeOut
    ? interpolate(f, [duracion - FADE, duracion], [1, 0], { extrapolateLeft: "clamp" })
    : 1;
  return <AbsoluteFill style={{ opacity: Math.min(a, b) }}>{children}</AbsoluteFill>;
};

/** Foto a pantalla completa con efecto Ken Burns. */
export const Foto: React.FC<{
  src: string;
  duracion: number;
  zoom?: [number, number];
  mover?: [number, number]; // desplazamiento horizontal en %
  moverY?: [number, number];
  gris?: number; // 0..1
  oscuro?: number; // 0..1
  desenfoque?: number;
  origen?: string;
}> = ({
  src,
  duracion,
  zoom = [1.05, 1.2],
  mover = [0, 0],
  moverY = [0, 0],
  gris = 0,
  oscuro = 0.35,
  desenfoque = 0,
  origen = "center",
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, duracion], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const s = zoom[0] + (zoom[1] - zoom[0]) * t;
  const x = mover[0] + (mover[1] - mover[0]) * t;
  const y = moverY[0] + (moverY[1] - moverY[0]) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img
        src={staticFile(src.includes("/") ? src : `fotos/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: origen,
          transform: `scale(${s}) translate(${x}%, ${y}%)`,
          filter: `grayscale(${gris}) contrast(${1 + gris * 0.15}) blur(${desenfoque}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,${oscuro * 0.6}) 0%, rgba(0,0,0,${Math.min(
            1,
            oscuro * 1.6
          )}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Texto que entra con resorte (sube y aparece). */
export const TextoEntra: React.FC<{
  inicio?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  desde?: number;
}> = ({ inicio = 0, children, style, desde = 60 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useU();
  const p = spring({ frame: f - inicio, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <div
      style={{
        fontFamily: FUENTE,
        color: colores.blanco,
        opacity: p,
        transform: `translateY(${(1 - p) * desde * u}px)`,
        textShadow: `0 ${4 * u}px ${24 * u}px rgba(0,0,0,0.55)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Barra de acento que crece. */
export const Barra: React.FC<{ inicio?: number; color?: string; ancho?: number }> = ({
  inicio = 0,
  color = colores.dorado,
  ancho = 160,
}) => {
  const f = useCurrentFrame();
  const u = useU();
  const w = interpolate(f - inicio, [0, 18], [0, ancho], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ width: w * u, height: 8 * u, background: color, borderRadius: 4 * u, margin: `${24 * u}px auto` }} />
  );
};

export const Centro: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => {
  const u = useU();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: `0 ${70 * u}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Viñeta y grano suave para dar look cinematográfico. */
export const Vineta: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);
