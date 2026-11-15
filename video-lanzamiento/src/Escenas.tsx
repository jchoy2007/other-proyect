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
import { Barra, Centro, Escena, Foto, FUENTE, TextoEntra, useU, useVertical, Vineta } from "./ui";

const titulo = (u: number, size = 120): React.CSSProperties => ({
  fontSize: size * u,
  fontWeight: 900,
  letterSpacing: -1 * u,
  lineHeight: 1.02,
  textTransform: "uppercase",
});
const sub = (u: number, size = 46): React.CSSProperties => ({
  fontSize: size * u,
  fontWeight: 500,
  lineHeight: 1.25,
  opacity: 0.95,
});

// ---------------------------------------------------------------- 1. Gancho
export const Gancho: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  return (
    <Escena duracion={d} fadeIn={false}>
      <Foto src="bahia-noche.jpg" duracion={d} zoom={[1.3, 1.08]} oscuro={0.45} />
      <Centro>
        <TextoEntra inicio={8} style={{ ...sub(u, 34), letterSpacing: 10 * u, color: colores.doradoClaro, fontWeight: 700 }}>
          CIUDAD DE PANAMÁ
        </TextoEntra>
        <TextoEntra inicio={16} style={titulo(u, 132)}>
          Panamá
          <br />
          crece.
        </TextoEntra>
        <Barra inicio={40} />
        <TextoEntra inicio={62} style={sub(u, 50)}>
          Comprar tu propiedad debería
          <br />
          ser un sueño…
        </TextoEntra>
      </Centro>
      <Vineta />
    </Escena>
  );
};

// ---------------------------------------------------------------- 2. Problema
const ProblemaBase: React.FC<{
  d: number;
  foto: string;
  zoom?: [number, number];
  mover?: [number, number];
  children: React.ReactNode;
}> = ({ d, foto, zoom = [1.1, 1.25], mover = [0, 0], children }) => (
  <Escena duracion={d}>
    <Foto src={foto} duracion={d} zoom={zoom} mover={mover} gris={1} oscuro={0.45} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,0,0,0.25), rgba(0,0,0,0.35))" }} />
    <Centro>{children}</Centro>
    <Vineta />
  </Escena>
);

export const Burocracia: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const items = ["Requisitos", "Papeles", "Firmas", "Filas", "Más papeles"];
  return (
    <ProblemaBase d={d} foto="balboa-dia.jpg" mover={[-2, 2]}>
      <TextoEntra inicio={4} style={{ ...sub(u, 36), color: colores.rojo, fontWeight: 800, letterSpacing: 8 * u }}>
        ✕ PROBLEMA 1
      </TextoEntra>
      <TextoEntra inicio={10} style={titulo(u, 128)}>
        Burocracia
      </TextoEntra>
      <Barra inicio={24} color={colores.rojo} />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18 * u, maxWidth: 900 * u }}>
        {items.map((t, i) => (
          <TextoEntra
            key={t}
            inicio={34 + i * 10}
            desde={30}
            style={{
              ...sub(u, 36),
              fontWeight: 600,
              padding: `${10 * u}px ${26 * u}px`,
              border: `${3 * u}px solid rgba(255,255,255,0.7)`,
              borderRadius: 60 * u,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            {t}
          </TextoEntra>
        ))}
      </div>
    </ProblemaBase>
  );
};

export const Espera: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const dia = Math.round(
    interpolate(f, [20, d - 20], [1, 180], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    })
  );
  return (
    <ProblemaBase d={d} foto="balboa-noche.jpg" zoom={[1.25, 1.08]}>
      <TextoEntra inicio={4} style={{ ...sub(u, 36), color: colores.rojo, fontWeight: 800, letterSpacing: 8 * u }}>
        ✕ PROBLEMA 2
      </TextoEntra>
      <TextoEntra inicio={10} style={titulo(u, 120)}>
        Meses de
        <br />
        espera
      </TextoEntra>
      <Barra inicio={24} color={colores.rojo} />
      <TextoEntra inicio={20} style={{ fontSize: 96 * u, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        DÍA {dia}
      </TextoEntra>
      <TextoEntra inicio={40} style={sub(u, 40)}>
        …y tu trámite sigue sin avanzar.
      </TextoEntra>
    </ProblemaBase>
  );
};

export const Banco: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sello = spring({ frame: f - 46, fps, config: { damping: 9, stiffness: 160 } });
  return (
    <ProblemaBase d={d} foto="torre-balboa.jpg" zoom={[1.05, 1.2]} >
      <TextoEntra inicio={4} style={{ ...sub(u, 36), color: colores.rojo, fontWeight: 800, letterSpacing: 8 * u }}>
        ✕ PROBLEMA 3
      </TextoEntra>
      <TextoEntra inicio={10} style={titulo(u, 112)}>
        Trabas con
        <br />
        el banco
      </TextoEntra>
      <Barra inicio={24} color={colores.rojo} />
      <TextoEntra inicio={30} style={sub(u, 40)}>
        Requisitos que cambian. Respuestas que no llegan.
      </TextoEntra>
      <div
        style={{
          marginTop: 50 * u,
          fontFamily: FUENTE,
          fontWeight: 900,
          fontSize: 84 * u,
          letterSpacing: 6 * u,
          color: colores.rojo,
          border: `${8 * u}px solid ${colores.rojo}`,
          borderRadius: 14 * u,
          padding: `${8 * u}px ${36 * u}px`,
          opacity: interpolate(sello, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
          transform: `rotate(-12deg) scale(${interpolate(sello, [0, 1], [2.6, 1])})`,
          background: "rgba(0,0,0,0.25)",
        }}
      >
        RECHAZADO
      </div>
    </ProblemaBase>
  );
};

export const Desisten: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const tachado = interpolate(f, [60, 80], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <ProblemaBase d={d} foto="cinta-costera.jpg" zoom={[1.15, 1.02]}>
      <TextoEntra inicio={6} style={sub(u, 54)}>
        Y al final, muchos…
      </TextoEntra>
      <TextoEntra inicio={22} style={{ ...titulo(u, 140), color: colores.rojo, marginTop: 10 * u }}>
        desisten.
      </TextoEntra>
      <TextoEntra inicio={48} style={{ ...sub(u, 46), marginTop: 30 * u, position: "relative" }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          su propiedad soñada
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "52%",
              height: 6 * u,
              width: `${tachado}%`,
              background: colores.rojo,
              borderRadius: 3 * u,
            }}
          />
        </span>
      </TextoEntra>
    </ProblemaBase>
  );
};

// ---------------------------------------------------------------- 3. Giro
export const Giro: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const flash = interpolate(f, [d - 16, d - 6, d], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brillo = interpolate(f, [0, d], [0, 1]);
  return (
    <Escena duracion={d} fadeOut={false}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, rgba(217,164,65,${0.35 * brillo}) 0%, #000 65%)`,
        }}
      />
      <Centro>
        <TextoEntra inicio={8} style={{ ...titulo(u, 150), color: colores.doradoClaro }}>
          Hasta hoy.
        </TextoEntra>
      </Centro>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </Escena>
  );
};

// ---------------------------------------------------------------- 4. Solución
export const Entramos: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  return (
    <Escena duracion={d}>
      <Foto src="skyline-balboa.jpg" duracion={d} zoom={[1.08, 1.22]} mover={[2, -2]} oscuro={0.4} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,26,51,0.15), rgba(10,26,51,0.65))` }} />
      <Centro>
        <TextoEntra inicio={6} style={{ ...sub(u, 34), letterSpacing: 10 * u, color: colores.doradoClaro, fontWeight: 700 }}>
          AHORA
        </TextoEntra>
        <TextoEntra inicio={14} style={titulo(u, 124)}>
          Entramos
          <br />
          nosotros.
        </TextoEntra>
        <Barra inicio={34} />
        <TextoEntra inicio={50} style={sub(u, 48)}>
          Hacemos simple lo complicado.
        </TextoEntra>
      </Centro>
      <Vineta />
    </Escena>
  );
};

export const Experiencia: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const n = Math.round(
    interpolate(f, [12, 60], [0, marca.anosExperiencia], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );
  return (
    <Escena duracion={d}>
      <Foto src="tornillo.jpg" duracion={d} zoom={[1.1, 1.25]} moverY={[2, -2]} oscuro={0.4} origen="60% 40%" />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,26,51,0.0) 30%, rgba(10,26,51,0.75))` }} />
      <Centro>
        <TextoEntra
          inicio={6}
          style={{ fontSize: 300 * u, fontWeight: 900, color: colores.dorado, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
        >
          +{n}
        </TextoEntra>
        <TextoEntra inicio={20} style={titulo(u, 84)}>
          años de
          <br />
          experiencia
        </TextoEntra>
        <Barra inicio={40} />
        <TextoEntra inicio={56} style={sub(u, 44)}>
          Conocemos cada paso del proceso.
        </TextoEntra>
      </Centro>
      <Vineta />
    </Escena>
  );
};

const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={colores.dorado} />
    <path d="M7 12.5l3.2 3.2L17 9" stroke={colores.azul} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Ventajas: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const items = [
    "Conocemos el proceso",
    "Herramientas y tecnología propia",
    "Te acompañamos con el banco",
    "Resultados más rápidos y seguros",
  ];
  return (
    <Escena duracion={d}>
      <Foto src="balboa-dia.jpg" duracion={d} zoom={[1.2, 1.05]} mover={[2, -2]} oscuro={0.45} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,26,51,0.3), rgba(10,26,51,0.7))` }} />
      <Centro>
        <TextoEntra inicio={4} style={titulo(u, 92)}>
          Contigo en
          <br />
          cada paso
        </TextoEntra>
        <Barra inicio={20} />
        <div style={{ display: "flex", flexDirection: "column", gap: 26 * u, alignItems: "flex-start", marginTop: 10 * u }}>
          {items.map((t, i) => (
            <TextoEntra
              key={t}
              inicio={28 + i * 14}
              desde={0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22 * u,
                fontSize: 44 * u,
                fontWeight: 700,
                textAlign: "left",
                transform: undefined,
              }}
            >
              <Check size={56 * u} />
              {t}
            </TextoEntra>
          ))}
        </div>
      </Centro>
      <Vineta />
    </Escena>
  );
};

// ---------------------------------------------------------------- 5. Visión
export const Vision: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const f = useCurrentFrame();
  const corte = Math.round(d / 2);
  const op1 = interpolate(f, [corte - 12, corte], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op2 = interpolate(f, [corte, corte + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Escena duracion={d}>
      <Foto src="tornillo-ciudad.jpg" duracion={d} zoom={[1.12, 1.3]} moverY={[2, -1]} oscuro={0.35} origen="50% 35%" />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,26,51,0.1) 20%, rgba(10,26,51,0.8))` }} />
      <AbsoluteFill style={{ opacity: op1 }}>
        <Centro style={{ justifyContent: "flex-end", paddingBottom: 220 * u }}>
          <TextoEntra inicio={8} style={{ ...sub(u, 38), letterSpacing: 10 * u, color: colores.doradoClaro, fontWeight: 800 }}>
            NUESTRA FORTALEZA
          </TextoEntra>
          <TextoEntra inicio={18} style={titulo(u, 96)}>
            La experiencia
            <br />
            que te respalda
          </TextoEntra>
        </Centro>
      </AbsoluteFill>
      {f >= corte - 2 ? (
        <AbsoluteFill style={{ opacity: op2 }}>
          <Centro style={{ justifyContent: "flex-end", paddingBottom: 220 * u }}>
            <TextoEntra inicio={corte + 4} style={{ ...sub(u, 38), letterSpacing: 10 * u, color: colores.doradoClaro, fontWeight: 800 }}>
              NUESTRA VISIÓN
            </TextoEntra>
            <TextoEntra inicio={corte + 14} style={titulo(u, 80)}>
              Que tu inversión
              <br />
              en Panamá sea
              <br />
              una realidad
            </TextoEntra>
          </Centro>
        </AbsoluteFill>
      ) : null}
      <Vineta />
    </Escena>
  );
};

// ---------------------------------------------------------------- Logo
export const Logo: React.FC<{ size: number }> = ({ size }) => {
  if (marca.logo) {
    return <Img src={staticFile(marca.logo)} style={{ height: size, objectFit: "contain" }} />;
  }
  // Logo provisional: edificio estilizado con acento dorado
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="4" y="4" width="92" height="92" rx="22" fill="none" stroke={colores.dorado} strokeWidth="4" />
      <path d="M28 76V44l14-8v40" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      <path d="M46 76V26l14 8v42" fill="none" stroke={colores.dorado} strokeWidth="5" strokeLinejoin="round" />
      <path d="M64 76V48l10 6v22" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      <path d="M22 76h56" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};

// ---------------------------------------------------------------- 6. Página web
export const PaginaWeb: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f - 6, fps, config: { damping: 16, stiffness: 90 } });
  const anchoM = vertical ? 860 : 1180;
  const altoM = vertical ? 1180 : 640;
  const scroll = interpolate(f, [50, d - 30], [0, vertical ? 360 : 470], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <Escena duracion={d}>
      <Foto src="bahia-noche.jpg" duracion={d} zoom={[1.1, 1.2]} oscuro={0.7} desenfoque={10} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,26,51,0.6), rgba(10,26,51,0.9))` }} />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40 * u,
          fontFamily: FUENTE,
        }}
      >
        <TextoEntra inicio={4} style={{ ...titulo(u, vertical ? 70 : 60), textAlign: "center" }}>
          Conoce todos
          {vertical ? <br /> : " "}
          nuestros servicios
        </TextoEntra>

        {/* Maqueta de navegador */}
        <div
          style={{
            width: anchoM * u,
            height: altoM * u,
            borderRadius: 26 * u,
            overflow: "hidden",
            background: "#fff",
            boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.6)`,
            transform: `translateY(${(1 - entra) * 200 * u}px) scale(${0.9 + entra * 0.1})`,
            opacity: entra,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 64 * u,
              background: "#E9EDF3",
              display: "flex",
              alignItems: "center",
              gap: 12 * u,
              padding: `0 ${22 * u}px`,
              flexShrink: 0,
            }}
          >
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 16 * u, height: 16 * u, borderRadius: "50%", background: c }} />
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: 14 * u,
                height: 40 * u,
                borderRadius: 20 * u,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                padding: `0 ${20 * u}px`,
                fontSize: 24 * u,
                color: "#4A5568",
                fontWeight: 600,
              }}
            >
              🔒 {marca.web}
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div style={{ transform: `translateY(${-scroll * u}px)` }}>
              {/* Barra de navegación */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: `${18 * u}px ${30 * u}px`,
                  background: colores.azul,
                  color: "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 * u, fontWeight: 900, fontSize: 28 * u }}>
                  <Logo size={44 * u} /> {marca.nombre}
                </div>
                <div style={{ display: "flex", gap: 22 * u, fontSize: 20 * u, opacity: 0.85 }}>
                  <span>Servicios</span>
                  <span>Nosotros</span>
                  <span>Contacto</span>
                </div>
              </div>
              {/* Hero */}
              <div style={{ position: "relative", height: (vertical ? 460 : 340) * u, overflow: "hidden" }}>
                <Img
                  src={staticFile("fotos/skyline-balboa.jpg")}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, rgba(10,26,51,0.85), rgba(10,26,51,0.2))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: `0 ${40 * u}px`,
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: 46 * u, fontWeight: 900, lineHeight: 1.1, maxWidth: 600 * u }}>
                    {marca.slogan}
                  </div>
                  <div
                    style={{
                      marginTop: 24 * u,
                      alignSelf: "flex-start",
                      background: colores.dorado,
                      color: colores.azul,
                      fontWeight: 800,
                      fontSize: 22 * u,
                      padding: `${12 * u}px ${26 * u}px`,
                      borderRadius: 40 * u,
                    }}
                  >
                    Agenda tu asesoría
                  </div>
                </div>
              </div>
              {/* Servicios */}
              <div style={{ padding: `${36 * u}px ${30 * u}px`, background: "#F6F8FB" }}>
                <div style={{ fontSize: 34 * u, fontWeight: 900, color: colores.azul, marginBottom: 24 * u }}>
                  Nuestros servicios
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: vertical ? "1fr" : "1fr 1fr",
                    gap: 20 * u,
                  }}
                >
                  {marca.servicios.map((s, i) => (
                    <div
                      key={s}
                      style={{
                        background: "#fff",
                        borderRadius: 18 * u,
                        padding: `${26 * u}px ${26 * u}px`,
                        boxShadow: `0 ${6 * u}px ${20 * u}px rgba(10,26,51,0.08)`,
                        borderLeft: `${8 * u}px solid ${colores.dorado}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 20 * u,
                      }}
                    >
                      <div
                        style={{
                          width: 60 * u,
                          height: 60 * u,
                          borderRadius: 14 * u,
                          background: colores.azul,
                          color: colores.dorado,
                          fontWeight: 900,
                          fontSize: 28 * u,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        0{i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 28 * u, fontWeight: 800, color: colores.azul }}>{s}</div>
                        <div style={{ fontSize: 20 * u, color: "#5A6B82", marginTop: 6 * u }}>
                          Te guiamos de principio a fin.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  background: colores.azul,
                  color: "#fff",
                  padding: `${40 * u}px ${30 * u}px`,
                  fontSize: 30 * u,
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                ¿Listo para comprar sin complicaciones?
              </div>
            </div>
          </div>
        </div>

        <TextoEntra inicio={24} style={{ fontSize: 54 * u, fontWeight: 800, color: colores.doradoClaro }}>
          {marca.web}
        </TextoEntra>
      </AbsoluteFill>
    </Escena>
  );
};

// ---------------------------------------------------------------- 7. Cierre
export const Cierre: React.FC<{ d: number }> = ({ d }) => {
  const u = useU();
  const vertical = useVertical();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 90 } });
  const brillo = interpolate(f, [10, 50], [-120, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Escena duracion={d} fadeOut={false}>
      <Foto src="tornillo-detalle.jpg" duracion={d} zoom={[1.15, 1.3]} oscuro={0.85} desenfoque={6} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(19,48,92,0.75) 0%, rgba(10,26,51,0.97) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FUENTE,
          color: "#fff",
          textAlign: "center",
          padding: `0 ${60 * u}px`,
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(logo, [0, 1], [0.4, 1])})`,
            opacity: logo,
            position: "relative",
            overflow: "hidden",
            padding: 10 * u,
          }}
        >
          <Logo size={(vertical ? 300 : 240) * u} />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${brillo}%`,
              width: "30%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>
        <TextoEntra inicio={22} style={{ ...titulo(u, vertical ? 110 : 96), marginTop: 30 * u, letterSpacing: 4 * u }}>
          {marca.nombre}
        </TextoEntra>
        <TextoEntra inicio={34} style={{ ...sub(u, 40), color: colores.doradoClaro, fontWeight: 600 }}>
          {marca.slogan}
        </TextoEntra>
        <Barra inicio={48} ancho={220} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: vertical ? "1fr 1fr" : `repeat(${Math.min(marca.redes.length, 4)}, auto)`,
            columnGap: 50 * u,
            rowGap: 34 * u,
            marginTop: 20 * u,
          }}
        >
          {marca.redes.map((r, i) => (
            <TextoEntra
              key={r.red + r.usuario}
              inicio={60 + i * 8}
              desde={30}
              style={{ display: "flex", alignItems: "center", gap: 16 * u, fontSize: 34 * u, fontWeight: 600 }}
            >
              <div
                style={{
                  width: 72 * u,
                  height: 72 * u,
                  borderRadius: "50%",
                  border: `${3 * u}px solid ${colores.dorado}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconoRed red={r.red} size={40 * u} />
              </div>
              {r.usuario}
            </TextoEntra>
          ))}
        </div>
        <TextoEntra
          inicio={60 + marca.redes.length * 8 + 6}
          style={{ marginTop: 56 * u, fontSize: 46 * u, fontWeight: 800, color: colores.doradoClaro }}
        >
          {marca.web}
        </TextoEntra>
      </AbsoluteFill>
    </Escena>
  );
};
