// ============================================================
//  DATOS DE LA MARCA: edita solo este archivo y vuelve a renderizar
// ============================================================

export const marca = {
  nombre: "TU MARCA",
  slogan: "Tu propiedad en Panamá, sin complicaciones.",
  anosExperiencia: 15,
  web: "www.tumarca.com",

  // Si tienes el logo, ponlo en public/logo.png y escribe "logo.png".
  // Si lo dejas en null, se muestra un logo provisional.
  logo: null as string | null,

  // Música de fondo: pon un .mp3 en public/ y escribe su nombre, ej. "musica.mp3".
  musica: null as string | null,

  // Servicios que aparecen en la maqueta de la página web
  servicios: [
    "Trámites de compraventa",
    "Gestión de financiamiento bancario",
    "Asesoría legal inmobiliaria",
    "Avalúos y documentación",
  ],

  // Redes sociales del cierre (borra las que no uses)
  redes: [
    { red: "instagram", usuario: "@tumarca" },
    { red: "facebook", usuario: "/tumarca" },
    { red: "tiktok", usuario: "@tumarca" },
    { red: "whatsapp", usuario: "+507 6000-0000" },
  ] as { red: Red; usuario: string }[],
};

export type Red = "instagram" | "facebook" | "tiktok" | "whatsapp" | "linkedin" | "youtube";

export const colores = {
  azul: "#0A1A33",
  azulMedio: "#13305C",
  dorado: "#D9A441",
  doradoClaro: "#F2CD7A",
  rojo: "#E5484D",
  blanco: "#FFFFFF",
};
