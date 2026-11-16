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
import { colores, marca } from "./config";
import { IconoRed } from "./iconos";
import { Barra, Centro, CINZEL, Escena, Foto, FUENTE, SANS, TextoEntra, useU, useVertical, Vineta } from "./ui";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const titulo = (u: number, size = 96): React.CSSProperties => ({
  fontFamily: FUENTE,
  fontSize: size * u,
  fontWeight: 700,
  lineHeight: 1.12,
});
const kicker = (u: number, color: string = colores.doradoClaro): React.CSSProperties => ({
  fontFamily: CINZEL,
  fontSize: 30 * u,
  fontWeight: 700,
  letterSpacing: 10 * u,
  color,
  textShadow: "none",
});
const cuerpo = (u: number, size = 42): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: size * u,
  fontWeight: 400,
  lineHeight: 1.4,
});

const Logo: React.FC<{ archivo: string; alto: number; style?: React.CSSProperties }> = ({ archivo, alto, style }) => (
  <Img src={staticFile(`logos/${archivo}.png`)} style={{ height: alto, objectFit: "contain", ...style }} />
);

// ------------------------------------------------ 1. Familias e inversionistas encuentran su propiedad
export const Familia: React.FC<{ d: number; voz?: number[] }> = ({ d, voz = [20, 140, 260] }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const fase = (a: number, b: number) =>
    Math.min(interpolate(f, [a - 10, a + 4], [0, 1], cl), interpolate(f, [b - 10, b + 2], [1, 0], cl));
  const f1 = fase(-20, voz[1]);
  const f2 = fase(voz[1], voz[2]);
  const f3 = interpolate(f, [voz[2] - 10, voz[2] + 4], [0, 1], cl);
  const tipos = ["Apartamento", "Casa", "Casa de playa", "Local comercial"];
  const bloque = (op: number, children: React.ReactNode) => (
    <AbsoluteFill style={{ opacity: op }}>
      <Centro style={{ justifyContent: "flex-end", paddingBottom: (vertical ? 260 : 150) * u }}>{children}</Centro>
    </AbsoluteFill>
  );
  return (
    <Escena duracion={d} fadeIn={false}>
      <Foto src="skyline-balboa.jpg" duracion={d} zoom={[1.3, 1.08]} mover={[3, 0]} oscuro={0.3} />
      <AbsoluteFill style={{ opacity: Math.max(f2, f3) }}>
        <Foto src="bahia-noche.jpg" duracion={d} zoom={[1.1, 1.25]} oscuro={0.3} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: f3 }}>
        <Foto src="tornillo.jpg" duracion={d} zoom={[1.05, 1.15]} oscuro={0.35} origen="60% 40%" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(35,31,32,0) 35%, rgba(35,31,32,0.88))" }} />
      {bloque(
        f1,
        <>
          <TextoEntra inicio={voz[0] - 10} style={kicker(u)}>CIUDAD DE PANAMÁ</TextoEntra>
          <Barra inicio={voz[0]} ancho={90} />
          <TextoEntra inicio={voz[0] + 4} style={titulo(u, vertical ? 80 : 74)}>
            Una familia que busca
            <br />
            <span style={{ color: colores.doradoClaro, fontStyle: "italic" }}>su hogar en Panamá.</span>
          </TextoEntra>
        </>
      )}
      {bloque(
        f2,
        <>
          <TextoEntra inicio={voz[1]} style={kicker(u)}>DESDE EL EXTRANJERO</TextoEntra>
          <Barra inicio={voz[1] + 6} ancho={90} />
          <TextoEntra inicio={voz[1] + 8} style={titulo(u, vertical ? 80 : 74)}>
            Un inversionista que
            <br />
            <span style={{ color: colores.doradoClaro, fontStyle: "italic" }}>apuesta por Panamá.</span>
          </TextoEntra>
        </>
      )}
      {bloque(
        f3,
        <>
          <TextoEntra inicio={voz[2]} style={titulo(u, vertical ? 80 : 74)}>
            Todos encontraron
            <br />
            <span style={{ color: colores.doradoClaro, fontStyle: "italic" }}>la propiedad ideal.</span>
          </TextoEntra>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 * u, marginTop: 34 * u, maxWidth: (vertical ? 900 : 1300) * u }}>
            {tipos.map((t, i) => (
              <TextoEntra
                key={t}
                inicio={voz[2] + 16 + i * 8}
                desde={24}
                style={{
                  fontFamily: SANS,
                  fontSize: (vertical ? 32 : 28) * u,
                  fontWeight: 500,
                  padding: `${10 * u}px ${26 * u}px`,
                  border: `${2 * u}px solid ${colores.doradoClaro}`,
                  borderRadius: 40 * u,
                  background: "rgba(20,18,19,0.45)",
                }}
              >
                {t}
              </TextoEntra>
            ))}
          </div>
        </>
      )}
      <Vineta />
    </Escena>
  );
};

// ------------------------------------------------ 2. Y entonces empezó el trámite
export const Tramite: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const gris = interpolate(f, [10, d - 20], [0, 1], cl);
  return (
    <Escena duracion={d}>
      <Foto src="torre-balboa.jpg" duracion={d} zoom={[1.05, 1.2]} gris={gris} oscuro={0.35 + gris * 0.25} />
      <Centro>
        <TextoEntra inicio={8} style={titulo(u, 92)}>
          Y entonces
          <br />
          empezó el trámite.
        </TextoEntra>
      </Centro>
      <Vineta />
    </Escena>
  );
};

// ------------------------------------------------ 3. Cinco puertas
const Puerta: React.FC<{ nombre: string; inicio: number; cerrada: boolean; i: number; tc: number }> = ({ nombre, inicio, cerrada, i, tc }) => {
  const u = useU() * (useVertical() ? 0.95 : 1.15);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - inicio, fps, config: { damping: 16, stiffness: 120 } });
  const cierre = cerrada ? interpolate(f, [tc, tc + 15], [0, 1], cl) : 0;
  const temblor = cerrada ? Math.sin(f * 1.6) * interpolate(f, [tc, tc + 8, tc + 25], [0, 6, 0], cl) : 0;
  const color = cierre > 0.5 ? colores.rojo : colores.doradoClaro;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 40 * u}px) translateX(${temblor * u}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14 * u,
      }}
    >
      <div
        style={{
          width: 120 * u,
          height: 190 * u,
          border: `${4 * u}px solid ${color}`,
          borderRadius: `${60 * u}px ${60 * u}px ${6 * u}px ${6 * u}px`,
          position: "relative",
          background: `rgba(181,71,58,${cierre * 0.25})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FUENTE,
            fontSize: 54 * u,
            fontWeight: 700,
            color,
          }}
        >
          {cierre > 0.5 ? "✕" : i + 1}
        </div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 26 * u, fontWeight: 600, color: cierre > 0.5 ? colores.rojo : "#fff" }}>{nombre}</div>
    </div>
  );
};

export const Puertas: React.FC<{ d: number; voz?: number[] }> = ({ d, voz = [20, 150, 255] }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const fase2 = interpolate(f, [voz[2] - 8, voz[2] + 6], [0, 1], cl);
  const tCae = voz[2] + 62; // "…y la venta se cae" (coincide con el golpe grave de la música)
  return (
    <Escena duracion={d}>
      <Foto src="balboa-noche.jpg" duracion={d} zoom={[1.2, 1.3]} gris={1} oscuro={0.85} desenfoque={6} />
      <Centro>
        <TextoEntra inicio={6} style={kicker(u)}>PARA LOGRAR LA COMPRAVENTA</TextoEntra>
        <TextoEntra inicio={12} style={{ ...titulo(u, 110), marginTop: 14 * u }}>
          Cinco puertas.
        </TextoEntra>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: `${40 * u}px ${(vertical ? 22 : 60) * u}px`,
            marginTop: 60 * u,
            maxWidth: (vertical ? 1000 : 1500) * u,
            flexWrap: "nowrap",
          }}
        >
          {marca.puertas.map((n, i) => (
            <Puerta key={n} nombre={n} inicio={voz[0] + 4 + i * 24} cerrada={n === "Banco"} i={i} tc={tCae - 10} />
          ))}
        </div>
        <div style={{ position: "relative", height: 140 * u, width: "100%", marginTop: 50 * u }}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - fase2 }}>
            <TextoEntra inicio={voz[1]} style={cuerpo(u, 38)}>
              Cinco puertas… y el cliente es quien las camina.
            </TextoEntra>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: fase2 }}>
            <TextoEntra inicio={voz[2]} style={{ ...cuerpo(u, 38) }}>
              Un papel vencido, una carta incompleta…
            </TextoEntra>
            <TextoEntra inicio={tCae} style={{ ...titulo(u, 64), color: colores.rojo, marginTop: 8 * u }}>
              y la venta se cae.
            </TextoEntra>
          </div>
        </div>
      </Centro>
      <Vineta />
    </Escena>
  );
};

// ------------------------------------------------ 4. Una sola llave
export const Llave: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const brillo = interpolate(f, [0, d], [0.1, 0.45]);
  return (
    <Escena duracion={d}>
      <AbsoluteFill
        style={{ background: `radial-gradient(circle at center, rgba(168,132,47,${brillo}) 0%, ${colores.negroProfundo} 60%)` }}
      />
      <Centro>
        <TextoEntra inicio={6} style={{ ...titulo(u, 70), color: "#fff" }}>
          Cinco puertas.
        </TextoEntra>
        <TextoEntra inicio={26} style={{ ...titulo(u, 110), color: colores.doradoClaro, fontStyle: "italic" }}>
          Una sola llave.
        </TextoEntra>
      </Centro>
    </Escena>
  );
};

// ------------------------------------------------ 5. Equipo de liderazgo
export const Equipo: React.FC<{ d: number; voz?: number[] }> = ({ d, voz = [14, 250] }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const corte = voz[1] - 4;
  const op1 = interpolate(f, [corte - 10, corte], [1, 0], cl);
  const op2 = interpolate(f, [corte, corte + 10], [0, 1], cl);
  return (
    <Escena duracion={d}>
      <Foto src="manos-oficina.jpg" duracion={d} zoom={[1.08, 1.22]} mover={[2, -1]} oscuro={0.3} origen="35% 40%" />
      <AbsoluteFill style={{ opacity: op2 }}>
        <Foto src="manos-acuerdo.jpg" duracion={d} zoom={[1.15, 1.05]} oscuro={0.3} origen="55% 50%" />
      </AbsoluteFill>
      {/* tono cálido dorado */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(200,160,80,0.35), rgba(120,95,60,0.6) 80%)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,18,19,0) 30%, rgba(20,18,19,0.88))" }} />
      <Centro style={{ justifyContent: "flex-end", paddingBottom: (vertical ? 230 : 120) * u }}>
        <TextoEntra inicio={voz[0] - 4} style={kicker(u)}>NUESTRO EQUIPO</TextoEntra>
        <div style={{ position: "relative", width: "100%", minHeight: (vertical ? 520 : 330) * u, marginTop: 20 * u }}>
          <div style={{ position: "absolute", inset: 0, opacity: op1 }}>
            <TextoEntra inicio={voz[0] + 4} style={titulo(u, vertical ? 64 : 56)}>
              Un equipo de liderazgo con
              <br />
              <span style={{ color: colores.doradoClaro, fontStyle: "italic" }}>
                más de {marca.anosExperiencia} años de experiencia
              </span>
              <br />
              en el sector bancario,
              {vertical ? <br /> : " "}
              financiero e inmobiliario.
            </TextoEntra>
          </div>
          {f >= corte - 2 ? (
            <div style={{ position: "absolute", inset: 0, opacity: op2 }}>
              <TextoEntra inicio={corte + 4} style={{ ...titulo(u, vertical ? 62 : 56), fontStyle: "italic" }}>
                “Cuando decimos que entendemos al banco,
                <br />
                no es un eslogan.
                <br />
                <span style={{ color: colores.doradoClaro }}>Es nuestra historia.”</span>
              </TextoEntra>
            </div>
          ) : null}
        </div>
      </Centro>
      <Vineta />
    </Escena>
  );
};

// ------------------------------------------------ 6. Por eso nació Holding Realty Properties
export const Nace: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - 8, fps, config: { damping: 14, stiffness: 70 } });
  return (
    <Escena duracion={d}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #FFFDF8 0%, ${colores.crema} 70%)` }} />
      <Centro>
        <div style={{ opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})` }}>
          <Logo archivo="HRP_logo_color" alto={420 * u} />
        </div>
        <TextoEntra inicio={40} style={{ ...titulo(u, 56), color: colores.negro, textShadow: "none", marginTop: 40 * u }}>
          Por eso nació
          <br />
          <span style={{ color: colores.dorado }}>{marca.nombre}.</span>
        </TextoEntra>
      </Centro>
    </Escena>
  );
};

// ------------------------------------------------ 7. Dos empresas, un solo recorrido
export const DosEmpresas: React.FC<{ d: number; voz?: number[] }> = ({ d, voz = [8, 50] }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 16 } });
  const b = spring({ frame: f - (voz[1] - 2), fps, config: { damping: 16 } });
  const linea = interpolate(f, [voz[1] - 12, voz[1] + 8], [0, 1], cl);
  const bloque = (p: number, logo: string, alto: number, texto: React.ReactNode) => (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 40 * u}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24 * u,
        width: (vertical ? 820 : 760) * u,
      }}
    >
      <div style={{ height: 420 * u, display: "flex", alignItems: "center" }}>
        <Logo archivo={logo} alto={alto * u} />
      </div>
      <div style={{ ...titulo(u, vertical ? 58 : 52), color: colores.negro, textAlign: "center" }}>{texto}</div>
    </div>
  );
  return (
    <Escena duracion={d}>
      <AbsoluteFill style={{ background: colores.crema }} />
      <AbsoluteFill
        style={{
          flexDirection: vertical ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 50 * u,
        }}
      >
        {bloque(a, "HRP_logo_color", vertical ? 400 : 380, <>Vendemos el inmueble.</>)}
        <div
          style={{
            background: colores.dorado,
            width: vertical ? 300 * u * linea : 3 * u,
            height: vertical ? 3 * u : 360 * u * linea,
          }}
        />
        {bloque(
          b,
          "CHS_logo_color",
          vertical ? 250 : 230,
          <>
            Y lo llevamos hasta el desembolso
            <br />
            <span style={{ color: colores.dorado }}>y la entrega de llaves.</span>
          </>
        )}
      </AbsoluteFill>
    </Escena>
  );
};

// ------------------------------------------------ 8. Un solo acompañante (recorrido hasta la entrega de llaves)
const IconoLlave: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="20" cy="32" r="12" stroke={color} strokeWidth="5" />
    <circle cx="20" cy="32" r="4" fill={color} />
    <path d="M32 32h26M50 32v9M42 32v6" stroke={color} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export const Recorrido: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const n = marca.pasos.length;
  const avance = interpolate(f, [20, 20 + n * 14], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) });
  const largo = (vertical ? 760 : 1500) * u;
  const { fps } = useVideoConfig();
  const tLlave = 20 + n * 14 + 4;
  const llave = spring({ frame: f - tLlave, fps, config: { damping: 11, stiffness: 90 } });
  return (
    <Escena duracion={d}>
      <Foto src="tornillo-ciudad.jpg" duracion={d} zoom={[1.15, 1.25]} oscuro={0.8} desenfoque={4} />
      <AbsoluteFill style={{ background: "rgba(20,18,19,0.55)" }} />
      <Centro>
        <TextoEntra inicio={4} style={kicker(u)}>DE LA BÚSQUEDA A LAS LLAVES</TextoEntra>
        <TextoEntra inicio={10} style={{ ...titulo(u, vertical ? 78 : 64), marginTop: 16 * u }}>
          Un solo acompañante.
        </TextoEntra>
        <div
          style={{
            position: "relative",
            width: vertical ? 760 * u : largo,
            height: vertical ? largo * 0.82 : 130 * u,
            marginTop: (vertical ? 60 : 50) * u,
          }}
        >
          {/* línea */}
          <div
            style={{
              position: "absolute",
              background: "rgba(255,255,255,0.2)",
              ...(vertical
                ? { left: 60 * u, top: 0, bottom: 0, width: 4 * u }
                : { top: 38 * u, left: 0, right: 0, height: 4 * u }),
            }}
          />
          <div
            style={{
              position: "absolute",
              background: colores.doradoClaro,
              ...(vertical
                ? { left: 60 * u, top: 0, height: `${avance * 100}%`, width: 4 * u }
                : { top: 38 * u, left: 0, width: `${avance * 100}%`, height: 4 * u }),
            }}
          />
          {marca.pasos.map((p, i) => {
            const pos = i / (n - 1);
            const on = interpolate(avance, [pos - 0.04, pos + 0.02], [0, 1], cl);
            const ultimo = i === n - 1;
            return (
              <div
                key={p}
                style={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: vertical ? "row" : "column",
                  alignItems: "center",
                  gap: 22 * u,
                  ...(vertical
                    ? { left: 22 * u, top: `calc(${pos * 100}% - ${38 * u}px)` }
                    : { top: 0, left: `calc(${pos * 100}% - ${38 * u}px)`, width: 76 * u }),
                }}
              >
                <div
                  style={{
                    width: 76 * u,
                    height: 76 * u,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: `${4 * u}px solid ${on > 0.5 ? colores.doradoClaro : "rgba(255,255,255,0.3)"}`,
                    background: on > 0.5 ? (ultimo ? colores.doradoClaro : colores.negro) : colores.negro,
                    color: ultimo && on > 0.5 ? colores.negro : colores.doradoClaro,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FUENTE,
                    fontWeight: 700,
                    fontSize: 34 * u,
                    transform: `scale(${1 + on * 0.08})`,
                  }}
                >
                  {ultimo ? <IconoLlave size={46 * u} color={on > 0.5 ? colores.negro : colores.doradoClaro} /> : i + 1}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: (vertical ? 38 : 26) * u,
                    color: "#fff",
                    opacity: 0.3 + on * 0.7,
                    whiteSpace: "nowrap",
                    textAlign: vertical ? "left" : "center",
                  }}
                >
                  {p}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: (vertical ? 70 : 40) * u, display: "flex", alignItems: "center", gap: 26 * u, flexDirection: vertical ? "column" : "row" }}>
          <div
            style={{
              opacity: llave,
              transform: `scale(${interpolate(llave, [0, 1], [0.4, 1])}) rotate(${interpolate(llave, [0, 1], [-35, 0])}deg)`,
              filter: `drop-shadow(0 0 ${24 * u * llave}px rgba(217,188,110,0.6))`,
            }}
          >
            <IconoLlave size={(vertical ? 150 : 110) * u} color={colores.doradoClaro} />
          </div>
          <TextoEntra inicio={tLlave + 8} style={{ ...titulo(u, vertical ? 56 : 50), textAlign: vertical ? "center" : "left" }}>
            Hasta la entrega de las llaves
            <br />
            <span style={{ color: colores.doradoClaro, fontStyle: "italic" }}>de tu nuevo hogar.</span>
          </TextoEntra>
        </div>
      </Centro>
      <Vineta />
    </Escena>
  );
};

// ------------------------------------------------ 9. Nuestra casa: Torre BICSA, frente a la bahía
export const Casa: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const corte = Math.round(d / 2);
  const op2 = interpolate(f, [corte - 8, corte + 8], [0, 1], cl);
  return (
    <Escena duracion={d}>
      <Foto src="torre-bicsa.jpg" duracion={d} zoom={[1.05, 1.2]} moverY={[2, -2]} oscuro={0.35} />
      <AbsoluteFill style={{ opacity: op2 }}>
        <Foto src="marca/vista-bahia-oficina.jpg" duracion={d} zoom={[1.1, 1.22]} mover={[-2, 1]} oscuro={0.3} origen="78% 50%" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(35,31,32,0) 40%, rgba(35,31,32,0.85))" }} />
      <Centro style={{ justifyContent: "flex-end", paddingBottom: 220 * u }}>
        <TextoEntra inicio={8} style={kicker(u)}>AVENIDA BALBOA · PANAMÁ</TextoEntra>
        <TextoEntra inicio={16} style={{ ...titulo(u, 72), marginTop: 14 * u }}>
          Desde la Torre BICSA,
          <br />
          <span style={{ color: colores.doradoClaro, fontStyle: "italic" }}>frente a la bahía.</span>
        </TextoEntra>
      </Centro>
      <Vineta />
    </Escena>
  );
};

// ------------------------------------------------ 10. Página web
export const PaginaWeb: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f - 4, fps, config: { damping: 16, stiffness: 90 } });
  const anchoM = vertical ? 900 : 1240;
  const altoM = vertical ? 1240 : 680;
  // portada ~2 s, baja despacio a los servicios y se queda quieta para leerlos
  const scroll = interpolate(f, [70, 130], [0, vertical ? 470 : 545], { ...cl, easing: Easing.inOut(Easing.cubic) });

  return (
    <Escena duracion={d}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #3a3233 0%, ${colores.negroProfundo} 70%)` }} />
      <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 * u }}>
        <TextoEntra inicio={2} style={{ ...titulo(u, vertical ? 64 : 56), textAlign: "center" }}>
          Conoce todos nuestros servicios
        </TextoEntra>
        <div
          style={{
            width: anchoM * u,
            height: altoM * u,
            borderRadius: 24 * u,
            overflow: "hidden",
            background: "#fff",
            boxShadow: `0 ${30 * u}px ${90 * u}px rgba(0,0,0,0.7), 0 0 0 ${2 * u}px rgba(168,132,47,0.5)`,
            transform: `translateY(${(1 - entra) * 180 * u}px) scale(${0.92 + entra * 0.08})`,
            opacity: entra,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ height: 60 * u, background: "#ECE8E0", display: "flex", alignItems: "center", gap: 12 * u, padding: `0 ${22 * u}px`, flexShrink: 0 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 15 * u, height: 15 * u, borderRadius: "50%", background: c }} />
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: 14 * u,
                height: 38 * u,
                borderRadius: 19 * u,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                padding: `0 ${20 * u}px`,
                fontFamily: SANS,
                fontSize: 22 * u,
                color: "#555",
              }}
            >
              🔒 {marca.web.replace("www.", "")}
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ transform: `translateY(${-scroll * u}px)`, fontFamily: SANS }}>
              {/* Navegación */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: `${14 * u}px ${30 * u}px`,
                  background: colores.negro,
                }}
              >
                <Logo archivo="HRP_logo_negativo_fondo_oscuro" alto={78 * u} />
                <div style={{ display: "flex", gap: (vertical ? 18 : 30) * u, fontSize: (vertical ? 18 : 19) * u, color: "#eee" }}>
                  <span>Propiedades</span>
                  <span>Financiamiento</span>
                  <span>Nosotros</span>
                  {vertical ? null : <span>Contacto</span>}
                </div>
              </div>
              {/* Hero */}
              <div style={{ position: "relative", height: (vertical ? 500 : 380) * u, overflow: "hidden" }}>
                <Img src={staticFile("marca/vista-bahia-oficina.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, rgba(35,31,32,0.9), rgba(35,31,32,0.25))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: `0 ${44 * u}px`,
                    color: "#fff",
                  }}
                >
                  <div style={{ fontFamily: CINZEL, fontSize: 18 * u, letterSpacing: 6 * u, color: colores.doradoClaro }}>
                    BIENES RAÍCES · FINANCIAMIENTO
                  </div>
                  <div style={{ fontFamily: FUENTE, fontSize: 50 * u, fontWeight: 700, lineHeight: 1.12, maxWidth: 640 * u, marginTop: 14 * u }}>
                    {marca.propuesta}
                  </div>
                  <div
                    style={{
                      marginTop: 26 * u,
                      alignSelf: "flex-start",
                      background: colores.dorado,
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 21 * u,
                      padding: `${12 * u}px ${28 * u}px`,
                      borderRadius: 6 * u,
                    }}
                  >
                    Agenda tu asesoría
                  </div>
                </div>
              </div>
              {/* Servicios */}
              <div style={{ padding: `${40 * u}px ${32 * u}px`, background: colores.crema }}>
                <div style={{ fontFamily: CINZEL, fontSize: 18 * u, letterSpacing: 6 * u, color: colores.dorado }}>LO QUE HACEMOS</div>
                <div style={{ fontFamily: FUENTE, fontSize: 40 * u, fontWeight: 700, color: colores.negro, margin: `${8 * u}px 0 ${26 * u}px` }}>
                  Nuestros servicios
                </div>
                <div style={{ display: "grid", gridTemplateColumns: vertical ? "1fr 1fr" : "1fr 1fr 1fr", gap: 18 * u }}>
                  {marca.servicios.map((s, i) => (
                    <div
                      key={s.t}
                      style={{
                        background: "#fff",
                        borderRadius: 10 * u,
                        padding: `${24 * u}px ${22 * u}px`,
                        borderTop: `${5 * u}px solid ${colores.dorado}`,
                        boxShadow: `0 ${6 * u}px ${20 * u}px rgba(35,31,32,0.08)`,
                      }}
                    >
                      <div style={{ fontFamily: FUENTE, fontSize: 32 * u, fontWeight: 700, color: colores.dorado }}>0{i + 1}</div>
                      <div style={{ fontSize: 27 * u, fontWeight: 600, color: colores.negro, marginTop: 6 * u, lineHeight: 1.25 }}>{s.t}</div>
                      <div style={{ fontSize: 20 * u, color: "#6b6460", marginTop: 6 * u }}>{s.d}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  background: colores.negro,
                  color: "#fff",
                  padding: `${44 * u}px ${30 * u}px`,
                  textAlign: "center",
                  fontFamily: FUENTE,
                  fontSize: 34 * u,
                  fontStyle: "italic",
                }}
              >
                Un solo acompañante, de la búsqueda a las llaves.
              </div>
            </div>
          </div>
        </div>
        <TextoEntra inicio={20} style={{ fontFamily: SANS, fontSize: 48 * u, fontWeight: 600, color: colores.doradoClaro }}>
          {marca.web}
        </TextoEntra>
      </AbsoluteFill>
    </Escena>
  );
};

// ------------------------------------------------ 11. Cierre
export const Cierre: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 6, fps, config: { damping: 14, stiffness: 80 } });
  const brillo = interpolate(f, [16, 56], [-40, 140], cl);
  const finalFade = interpolate(f, [d - 20, d], [1, 0], cl);
  return (
    <Escena duracion={d} fadeOut={false}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, #362f30 0%, ${colores.negroProfundo} 72%)` }} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: `0 ${60 * u}px`,
          opacity: finalFade,
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            opacity: logo,
            transform: `scale(${interpolate(logo, [0, 1], [0.8, 1])})`,
          }}
        >
          <Logo archivo="HRP_logo_negativo_fondo_oscuro" alto={(vertical ? 480 : 330) * u} />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${brillo}%`,
              width: "25%",
              background: "linear-gradient(90deg, transparent, rgba(255,240,200,0.35), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>
        {/* Licencia debajo del logo de Holding Realty Properties */}
        <TextoEntra
          inicio={18}
          desde={16}
          style={{ ...cuerpo(u, vertical ? 24 : 21), color: "#cfc6b4", letterSpacing: 2 * u, marginTop: 6 * u, textShadow: "none" }}
        >
          {marca.licencia}
        </TextoEntra>
        <TextoEntra inicio={30} style={{ ...titulo(u, vertical ? 50 : 44), fontStyle: "italic", marginTop: 26 * u }}>
          {marca.slogan}
        </TextoEntra>
        <TextoEntra inicio={40} style={{ ...cuerpo(u, 26), color: colores.doradoClaro, marginTop: 10 * u }}>
          {marca.propuesta}
        </TextoEntra>
        <Barra inicio={52} ancho={260} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: vertical ? "1fr" : "auto auto",
            columnGap: 70 * u,
            rowGap: 24 * u,
            justifyItems: vertical ? "center" : "start",
          }}
        >
          {marca.contacto.map((r, i) => (
            <TextoEntra
              key={r.red}
              inicio={60 + i * 7}
              desde={24}
              style={{ display: "flex", alignItems: "center", gap: 18 * u, fontFamily: SANS, fontSize: 32 * u, fontWeight: 500 }}
            >
              <div
                style={{
                  width: 62 * u,
                  height: 62 * u,
                  borderRadius: "50%",
                  border: `${2.5 * u}px solid ${colores.doradoClaro}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconoRed red={r.red} size={32 * u} color={colores.doradoClaro} />
              </div>
              {r.texto}
            </TextoEntra>
          ))}
        </div>
        <TextoEntra inicio={95} style={{ fontFamily: SANS, fontSize: 46 * u, fontWeight: 700, color: colores.doradoClaro, marginTop: 40 * u }}>
          {marca.web}
        </TextoEntra>
        <TextoEntra inicio={102} style={{ ...cuerpo(u, 22), color: "#bdb5a6", marginTop: 12 * u }}>
          {marca.direccion}
        </TextoEntra>
        <TextoEntra
          inicio={110}
          style={{ marginTop: 36 * u }}
        >
          {/* Corporate Holding Solutions, solo */}
          <Logo archivo="CHS_logo_negativo_fondo_oscuro" alto={(vertical ? 100 : 85) * u} />
        </TextoEntra>
      </AbsoluteFill>
    </Escena>
  );
};
