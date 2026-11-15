// ============================================================
//  DATOS DE LA MARCA: edita solo este archivo y vuelve a renderizar
// ============================================================

export const marca = {
  nombre: "Holding Realty Properties",
  aliada: "Corporate Holding Solutions",
  slogan: "Construyendo juntos un futuro de oportunidades",
  propuesta: "Vendemos el inmueble y gestionamos su financiamiento.",
  anosExperiencia: 25,
  web: "www.holdingrealty.com",
  direccion: "Torre BICSA Financial Center · Piso 36, Oficina 3611",
  licencia: "Licencia de corredor PJ-1601-2026",


  puertas: ["Promotora", "Corredor", "Banco", "Afianzadora", "Abogado"],

  pasos: ["Captación", "Pre-calificación", "Expediente", "Evaluación", "Formalización", "Desembolso", "Entrega de llaves"],

  // Servicios que aparecen en la maqueta de la página web
  servicios: [
    { t: "Venta y alquiler", d: "Residencial y comercial" },
    { t: "Proyectos de promotoras", d: "Comercialización de proyectos nuevos" },
    { t: "Pre-calificación bancaria", d: "Conoce tu capacidad de compra" },
    { t: "Gestión hasta el desembolso", d: "Banco, afianzadora y abogado" },
    { t: "Inversionistas", d: "Nacionales y extranjeros" },
    { t: "Administración de propiedades", d: "Tu inversión en buenas manos" },
  ],

  // Contacto del cierre
  contacto: [
    { red: "instagram", texto: "@holdingrealtyproperties" },
    { red: "whatsapp", texto: "6005-9211" },
    { red: "telefono", texto: "203-1664" },
    { red: "correo", texto: "info@holdingrealty.com" },
  ] as { red: Red; texto: string }[],
};

export type Red = "instagram" | "facebook" | "tiktok" | "whatsapp" | "linkedin" | "youtube" | "telefono" | "correo";

// Colores oficiales (hoja de marca)
export const colores = {
  negro: "#231F20",
  negroProfundo: "#141213",
  dorado: "#A8842F",
  doradoClaro: "#D9BC6E", // para texto dorado sobre fondo oscuro
  gris: "#414143",
  crema: "#F5EFE3",
  blanco: "#FFFFFF",
  rojo: "#B5473A",
};
