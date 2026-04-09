"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "customer" | "bot";
  text: string;
  time: string;
}

const catalog: Record<string, string> = {
  software: `💻 *CATALOGO DE SOFTWARE*\n(Entrega inmediata por email y WhatsApp)\n\n📦 *WINDOWS 11:*\n• Win 11 Home OEM - $10.00\n• Win 11 Home Retail - $15.00\n• Win 11 Pro OEM - $12.00\n• Win 11 Pro Retail - $17.00\n\n📦 *WINDOWS 10:*\n• Win 10 Home OEM - $8.00\n• Win 10 Pro OEM - $10.00\n\n📦 *MICROSOFT OFFICE:*\n• Office Pro Plus 2016 - $10.00\n• Office Pro Plus 2019 - $15.00\n• Office Pro Plus 2021 - $25.00\n• Office Pro Plus 2024 - $45.00\n\n📦 *WINDOWS SERVER:*\n• Server 2012 Standard - $12.00\n• Server 2019 Standard - $15.00\n• Server 2019 Datacenter - $25.00\n• Server 2022 Datacenter - $30.00\n• Server 2025 Standard - $25.00\n• Server 2025 Datacenter - $35.00\n\n¿Cual te interesa?`,
  mesas: `🖥️ *MESAS GAMER Y ELECTRICAS*\n(Envio GRATIS a todo Panama)\n\n🎮 *MESAS GAMER:*\n• Mesa S1-Y (LED) 140x60cm - $90\n• Mesa R5-7 140x60cm - $95\n• Mesa Z5-6 140x60cm - $95\n• Mesa H2 (LED) 140x60cm - $110\n• Mesa S2 Reversible "L" 190x60cm - $125\n\n⚡ *MESAS ELECTRICAS AJUSTABLES:*\n• Electrica Negra 140x60cm - $130\n• Electrica Blanca 140x60cm - $130\n• S60 Motor+LED 140x60cm - $145\n\n📦 Envio gratis por Red Servi a todo Panama\n\n¿Cual te interesa?`,
  pago: `💳 *METODOS DE PAGO:*\n\n📱 *Yappy:*\n• 6043-4542 (Jorge Choy)\n• 6537-0196 (Daysi Torres)\n\n🏦 *ACH / Transferencia:*\n• Banco General\n• Cuenta de Ahorros\n• Jorge Choy\n• Cuenta: 0472984345786\n\nDespues de pagar, envianos el comprobante por aqui y procesamos tu pedido de inmediato. ✅`,
  instalacion_windows: `🔧 *GUIA DE INSTALACION - WINDOWS:*\n\n1️⃣ Descargar la herramienta de creacion de medios de Microsoft\n2️⃣ Crear USB booteable\n3️⃣ Instalar Windows desde el USB\n4️⃣ Activar con la clave que te enviamos\n\n💡 Si necesitas ayuda, ofrecemos *instalacion remota gratuita*. Solo dinos y nos conectamos a tu PC para ayudarte.`,
  instalacion_office_2024: `🔧 *GUIA DE INSTALACION - OFFICE 2024:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el instalador:\n👉 https://softkeypc.com/wp-content/uploads/2024/12/Office_2024_ES_64Bits.exe\n2️⃣ Ejecuta el archivo descargado\n3️⃣ Sigue las instrucciones de instalacion\n4️⃣ Activa con tu clave al abrir Word, Excel o PowerPoint\n\n💡 Si necesitas ayuda, ofrecemos *instalacion remota gratuita*.`,
  instalacion_office_2021: `🔧 *GUIA DE INSTALACION - OFFICE 2021:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el archivo .IMG:\n👉 https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/es-es/ProPlus2021Retail.img\n2️⃣ Clic derecho > Montar (o extraer con WinRAR)\n3️⃣ Ejecuta setup.exe\n4️⃣ Activa con tu clave al abrir cualquier app de Office\n\n💡 Si necesitas ayuda, ofrecemos *instalacion remota gratuita*.`,
  instalacion_office_2019: `🔧 *GUIA DE INSTALACION - OFFICE 2019:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el archivo .IMG:\n👉 https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/es-es/ProPlus2019Retail.img\n2️⃣ Clic derecho > Montar (o extraer con WinRAR)\n3️⃣ Ejecuta setup.exe\n4️⃣ Activa con tu clave al abrir cualquier app de Office\n\n💡 Si necesitas ayuda, ofrecemos *instalacion remota gratuita*.`,
  instalacion_office_2016: `🔧 *GUIA DE INSTALACION - OFFICE 2016:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el archivo .IMG:\n👉 https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/es-es/ProPlusRetail.img\n2️⃣ Clic derecho > Montar (o extraer con WinRAR)\n3️⃣ Ejecuta setup.exe\n4️⃣ Activa con tu clave al abrir cualquier app de Office\n\n💡 Si necesitas ayuda, ofrecemos *instalacion remota gratuita*.`,
  oem_retail: `📋 *DIFERENCIA OEM vs RETAIL:*\n\n🔹 *OEM:* Licencia vinculada a 1 PC. No se puede transferir a otro equipo. Es mas economica.\n\n🔹 *Retail:* Licencia transferible. Si cambias de PC, puedes mover tu licencia al nuevo equipo.\n\n💡 Si tu PC es fijo y no piensas cambiarlo pronto, OEM es la mejor opcion. Si cambias de equipo seguido, Retail es mejor inversion.\n\n¿Te ayudo a elegir?`,
};

function getResponse(input: string): { text: string; delay: number } {
  const lower = input.toLowerCase().trim();

  // Saludos
  if (lower.match(/^(hola|hi|buenos|buenas|hey|que tal|saludos)/)) {
    return {
      text: "Hola! 👋 Bienvenido a *SynovaTech PTY* - Soluciones Tecnologicas Integrales.\n\n¿En que te puedo ayudar?\n\n1️⃣ Ver software (Windows, Office)\n2️⃣ Ver mesas gamer\n3️⃣ Metodos de pago\n4️⃣ Guia de instalacion\n5️⃣ Hablar con un asesor",
      delay: 800,
    };
  }

  // Software catalogo (SOLO si no menciona un producto especifico)
  if (lower === "1" || lower === "software" || lower === "licencias" || lower === "licencia") {
    return { text: catalog.software, delay: 1000 };
  }

  // Mesas catalogo (SOLO si no menciona un modelo especifico)
  if (lower === "2" || lower === "mesas" || lower === "mesa" || lower === "escritorio") {
    return { text: catalog.mesas, delay: 1000 };
  }

  // Pagos
  if (lower === "3" || lower.includes("pago") || lower.includes("yappy") || lower.includes("ach") || lower.includes("transferencia") || lower.includes("pagar")) {
    return { text: catalog.pago, delay: 800 };
  }

  // Instalacion Windows -> transferir a asesor
  if ((lower.includes("instalar") || lower.includes("instalacion") || lower.includes("descargar") || lower.includes("descarga")) && (lower.includes("windows") || lower.includes("win 10") || lower.includes("win 11"))) {
    return {
      text: "La instalacion de Windows requiere atencion personalizada para asegurarnos de que todo quede perfecto. 💻\n\nTe voy a conectar con un asesor que te guiara paso a paso o se conectara remotamente a tu PC para hacerlo por ti. *Sin costo adicional.*\n\nEn un momento te atendera. 👤\n\n[TRANSFERIR]",
      delay: 900,
    };
  }

  // Instalacion Office especifica
  if ((lower.includes("instalar") || lower.includes("instalacion") || lower.includes("descargar") || lower.includes("descarga")) && lower.includes("2024")) {
    return { text: catalog.instalacion_office_2024, delay: 900 };
  }
  if ((lower.includes("instalar") || lower.includes("instalacion") || lower.includes("descargar") || lower.includes("descarga")) && lower.includes("2021")) {
    return { text: catalog.instalacion_office_2021, delay: 900 };
  }
  if ((lower.includes("instalar") || lower.includes("instalacion") || lower.includes("descargar") || lower.includes("descarga")) && lower.includes("2019")) {
    return { text: catalog.instalacion_office_2019, delay: 900 };
  }
  if ((lower.includes("instalar") || lower.includes("instalacion") || lower.includes("descargar") || lower.includes("descarga")) && lower.includes("2016")) {
    return { text: catalog.instalacion_office_2016, delay: 900 };
  }

  // Instalacion general
  if (lower === "4" || lower.includes("instalacion") || lower.includes("instalar") || lower.includes("activar") || lower.includes("guia") || lower.includes("descargar") || lower.includes("descarga")) {
    return {
      text: "¿Para que producto necesitas la guia de instalacion?\n\n1️⃣ Windows (10 u 11) → Te conectamos con un asesor\n2️⃣ Office 2016\n3️⃣ Office 2019\n4️⃣ Office 2021\n5️⃣ Office 2024\n\n⚠️ Los Office son *solo para PC* (no compatibles con MAC).\n\n💡 Para Windows, un asesor te ayuda personalmente o se conecta a tu PC de forma remota sin costo.",
      delay: 800,
    };
  }

  // Agente
  if (lower === "5" || lower.includes("asesor") || lower.includes("persona") || lower.includes("humano") || lower.includes("agente")) {
    return {
      text: "Te conecto con un asesor de nuestro equipo. 👤\n\nEn un momento te atendera. Gracias por tu paciencia.\n\n[TRANSFERIR]",
      delay: 800,
    };
  }

  // OEM vs Retail (solo si pregunta la diferencia, no si pide un producto)
  if ((lower.includes("diferencia") || lower === "oem" || lower === "retail") && !lower.includes("win") && !lower.includes("pro") && !lower.includes("home")) {
    return { text: catalog.oem_retail, delay: 900 };
  }

  // === PRODUCTOS ESPECIFICOS - Respuesta directa con datos de pago ===

  // Windows 11 Pro OEM
  if (lower.includes("11 pro oem") || lower.includes("11 pro") && lower.includes("oem")) {
    return {
      text: "📦 *Windows 11 Pro OEM*\nPrecio: *$12.00*\n\nLicencia original Microsoft.\nActivacion permanente - 1 PC (no transferible).\nIncluye: BitLocker, Hyper-V, Remote Desktop.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $12.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Windows 11 Pro Retail
  if (lower.includes("11 pro retail") || (lower.includes("11 pro") && lower.includes("retail"))) {
    return {
      text: "📦 *Windows 11 Pro Retail*\nPrecio: *$17.00*\n\nLicencia original Microsoft.\nActivacion permanente - Transferible a otro PC.\nIncluye: BitLocker, Hyper-V, Remote Desktop.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $17.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Windows 11 Home OEM
  if (lower.includes("11 home oem") || (lower.includes("11 home") && lower.includes("oem"))) {
    return {
      text: "📦 *Windows 11 Home OEM*\nPrecio: *$10.00*\n\nLicencia original Microsoft.\nActivacion permanente - 1 PC (no transferible).\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $10.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Windows 11 Home Retail
  if (lower.includes("11 home retail") || (lower.includes("11 home") && lower.includes("retail"))) {
    return {
      text: "📦 *Windows 11 Home Retail*\nPrecio: *$15.00*\n\nLicencia original Microsoft.\nActivacion permanente - Transferible a otro PC.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $15.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Windows 11 Pro (sin especificar OEM/Retail)
  if (lower.includes("windows 11 pro") || lower.includes("win 11 pro")) {
    return {
      text: "📦 *Windows 11 Pro* - Tenemos 2 opciones:\n\n• *OEM* (1 PC, no transferible): *$12.00*\n• *Retail* (transferible a otro PC): *$17.00*\n\n💡 *OEM* es ideal si no piensas cambiar de PC. *Retail* si cambias de equipo seguido.\n\n¿Cual prefieres?",
      delay: 900,
    };
  }

  // Windows 11 Home (sin especificar)
  if (lower.includes("windows 11 home") || lower.includes("win 11 home")) {
    return {
      text: "📦 *Windows 11 Home* - Tenemos 2 opciones:\n\n• *OEM* (1 PC, no transferible): *$10.00*\n• *Retail* (transferible a otro PC): *$15.00*\n\n💡 *OEM* es ideal si no piensas cambiar de PC. *Retail* si cambias de equipo seguido.\n\n¿Cual prefieres?",
      delay: 900,
    };
  }

  // Windows 10 Pro OEM
  if (lower.includes("10 pro") || lower.includes("windows 10 pro") || lower.includes("win 10 pro")) {
    return {
      text: "📦 *Windows 10 Pro OEM*\nPrecio: *$10.00*\n\nLicencia original Microsoft.\nActivacion permanente - 1 PC.\nIncluye: BitLocker, Remote Desktop.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $10.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Windows 10 Home OEM
  if (lower.includes("10 home") || lower.includes("windows 10 home") || lower.includes("win 10 home")) {
    return {
      text: "📦 *Windows 10 Home OEM*\nPrecio: *$8.00*\n\nLicencia original Microsoft.\nActivacion permanente - 1 PC.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $8.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Office 2024
  if (lower.includes("office 2024") || lower.includes("2024")) {
    return {
      text: "📦 *Office Profesional Pro Plus 2024*\nPrecio: *$45.00*\n⚠️ *Solo para PC (no compatible con MAC)*\n\nIncluye: Word, Excel, PowerPoint, Outlook, Access, Publisher, Teams + IA.\nLicencia permanente - 1 PC.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $45.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Office 2021
  if (lower.includes("office 2021") || lower.includes("2021")) {
    return {
      text: "📦 *Office Profesional Pro Plus 2021*\nPrecio: *$25.00*\n⚠️ *Solo para PC (no compatible con MAC)*\n\nIncluye: Word, Excel, PowerPoint, Outlook, Access, Publisher, Teams.\nLicencia permanente - 1 PC.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $25.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Office 2019
  if (lower.includes("office 2019") || lower.includes("2019")) {
    return {
      text: "📦 *Office Profesional Pro Plus 2019*\nPrecio: *$15.00*\n⚠️ *Solo para PC (no compatible con MAC)*\n\nIncluye: Word, Excel, PowerPoint, Outlook, Access, Publisher.\nLicencia permanente - 1 PC.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $15.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Office 2016
  if (lower.includes("office 2016") || lower.includes("2016")) {
    return {
      text: "📦 *Office Profesional Pro Plus 2016*\nPrecio: *$10.00*\n⚠️ *Solo para PC (no compatible con MAC)*\n\nIncluye: Word, Excel, PowerPoint, Outlook, Access, Publisher.\nLicencia permanente - 1 PC.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $10.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // === WINDOWS SERVER ===

  // Server 2012 Standard
  if (lower.includes("2012") || lower.includes("server 2012")) {
    return {
      text: "📦 *Windows Server 2012 Standard Retail*\nPrecio: *$12.00*\n\nLicencia original Microsoft.\nActivacion permanente.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $12.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Server 2019 Datacenter
  if ((lower.includes("2019") && lower.includes("datacenter")) || lower.includes("server 2019 data")) {
    return {
      text: "📦 *Windows Server 2019 Datacenter Retail*\nPrecio: *$25.00*\n\nLicencia original Microsoft.\nActivacion permanente.\nVirtualizacion ilimitada + Shielded VMs.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $25.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Server 2019 Standard
  if (lower.includes("server 2019") || (lower.includes("2019") && lower.includes("standard"))) {
    return {
      text: "📦 *Windows Server 2019 Standard Retail*\nPrecio: *$15.00*\n\nLicencia original Microsoft.\nActivacion permanente.\nHyper-V, Storage Spaces.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $15.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Server 2022 Datacenter
  if (lower.includes("2022") || lower.includes("server 2022")) {
    return {
      text: "📦 *Windows Server 2022 Datacenter Retail*\nPrecio: *$30.00*\n\nLicencia original Microsoft.\nActivacion permanente.\nVirtualizacion ilimitada + Seguridad avanzada + Azure hybrid.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $30.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Server 2025 Datacenter
  if ((lower.includes("2025") && lower.includes("datacenter")) || lower.includes("server 2025 data")) {
    return {
      text: "📦 *Windows Server 2025 Datacenter Retail*\nPrecio: *$35.00*\n\nLicencia original Microsoft.\nActivacion permanente.\nVirtualizacion ilimitada + Todas las funciones enterprise.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $35.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // Server 2025 Standard
  if (lower.includes("server 2025") || (lower.includes("2025") && lower.includes("standard"))) {
    return {
      text: "📦 *Windows Server 2025 Standard Retail*\nPrecio: *$25.00*\n\nLicencia original Microsoft.\nActivacion permanente.\nSoporte extendido.\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga $25.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y te mandamos tu clave al instante.",
      delay: 1000,
    };
  }

  // "server" generico
  if (lower.includes("server") && !lower.includes("2012") && !lower.includes("2019") && !lower.includes("2022") && !lower.includes("2025")) {
    return {
      text: "📦 *WINDOWS SERVER* disponibles:\n\n• Server 2012 Standard - *$12.00*\n• Server 2019 Standard - *$15.00*\n• Server 2019 Datacenter - *$25.00*\n• Server 2022 Datacenter - *$30.00*\n• Server 2025 Standard - *$25.00*\n• Server 2025 Datacenter - *$35.00*\n\n⚡ Entrega inmediata.\n\n¿Cual necesitas?",
      delay: 900,
    };
  }

  // === MESAS ESPECIFICAS ===

  if (lower.includes("s1-y") || lower.includes("s1 y") || lower.includes("s1y")) {
    return {
      text: "🖥️ *Mesa Gamer S1-Y (con luces LED)*\nPrecio: *$90.00*\nDimensiones: 140 x 60 x 73 cm\n\nIncluye: Luces LED, estructura de acero, superficie antideslizante.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $90.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.",
      delay: 1000,
    };
  }

  if (lower.includes("r5-7") || lower.includes("r5 7") || lower.includes("r57")) {
    return {
      text: "🖥️ *Mesa Gamer R5-7*\nPrecio: *$95.00*\nDimensiones: 140 x 60 x 73 cm\n\nIncluye: Estructura de acero reforzado, superficie amplia, diseno ergonomico.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $95.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.",
      delay: 1000,
    };
  }

  if (lower.includes("z5-6") || lower.includes("z5 6") || lower.includes("z56")) {
    return {
      text: "🖥️ *Mesa Gamer Z5-6*\nPrecio: *$95.00*\nDimensiones: 140 x 60 x 73 cm\n\nIncluye: Diseno en Z estilizado, estructura de acero, superficie antideslizante.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $95.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.",
      delay: 1000,
    };
  }

  if (lower.includes("h2")) {
    return {
      text: "🖥️ *Mesa Gamer H2 (con luces LED)*\nPrecio: *$110.00*\nDimensiones: 140 x 60 x 73 cm\n\nIncluye: Luces LED integradas, estructura de acero, superficie antideslizante.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $110.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.",
      delay: 1000,
    };
  }

  if (lower.includes("s2") || lower.includes("forma l") || lower.includes("reversible")) {
    return {
      text: '🖥️ *Mesa Gamer S2 Reversible (forma "L" o recta)*\nPrecio: *$125.00*\nDimensiones: 190 x 60 x 73 cm\n\nLa mas grande! Configuracion en "L" o recta. Ideal para multiples monitores.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $125.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.',
      delay: 1000,
    };
  }

  if (lower.includes("electrica negra") || lower.includes("ajustable negra")) {
    return {
      text: "🖥️ *Mesa Electrica Ajustable - Negra*\nPrecio: *$130.00*\nDimensiones: 140 x 60 x 81-118 cm (ajustable)\n\nMotor electrico de ajuste de altura. Trabaja sentado o de pie.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $130.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.",
      delay: 1000,
    };
  }

  if (lower.includes("electrica blanca") || lower.includes("ajustable blanca")) {
    return {
      text: "🖥️ *Mesa Electrica Ajustable - Blanca*\nPrecio: *$130.00*\nDimensiones: 140 x 60 x 81-118 cm (ajustable)\n\nMotor electrico de ajuste de altura. Elegante y funcional.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $130.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.",
      delay: 1000,
    };
  }

  if (lower.includes("s60") || (lower.includes("electrica") && lower.includes("led"))) {
    return {
      text: "🖥️ *Mesa Electrica S60 (Motor + Luces LED)*\nPrecio: *$145.00*\nDimensiones: 140 x 60 x 81-118 cm (ajustable)\n\nLa mas completa! Motor electrico + luces LED.\n🚚 *Envio GRATIS* a todo Panama por Red Servi.\n\n💳 *Para comprar, paga $145.00 a:*\n📱 Yappy: 6043-4542 (Jorge Choy)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n📩 Envianos el comprobante por aqui y coordinamos el envio.",
      delay: 1000,
    };
  }

  // Comprar / quiero
  if (lower.includes("comprar") || lower.includes("quiero") || lower.includes("lo quiero") || lower.includes("si")) {
    return { text: `Perfecto! 🎉\n\nPara procesar tu compra:\n\n${catalog.pago}\n\n⚡ Apenas recibamos tu comprobante, te enviamos tu producto de inmediato.`, delay: 1000 };
  }

  // Envio
  if (lower.includes("envio") || lower.includes("enviar") || lower.includes("entrega") || lower.includes("red servi")) {
    return {
      text: "📦 *ENVIOS:*\n\n💻 *Software:* Entrega *inmediata* por email y WhatsApp. En minutos tienes tu clave.\n\n🖥️ *Mesas:* Envio *GRATIS* a todo Panama por Red Servi. Tiempo estimado: 3-5 dias habiles. Tambien puedes retirar en nuestras instalaciones.\n\n¿Necesitas algo mas?",
      delay: 900,
    };
  }

  // Garantia
  if (lower.includes("garantia") || lower.includes("original") || lower.includes("legal")) {
    return {
      text: "🛡️ *GARANTIA:*\n\nTodas nuestras licencias son *100% originales de Microsoft*.\n\n• Activacion permanente (de por vida)\n• Funcionan con actualizaciones de Windows/Office\n• Soporte de instalacion incluido\n• Si tienes algun problema con la activacion, lo resolvemos sin costo\n\n¿Te ayudo con algo mas?",
      delay: 900,
    };
  }

  // Factura
  if (lower.includes("factura")) {
    return {
      text: "🧾 Si, generamos factura con cada compra. Despues de confirmar tu pago, te la enviamos automaticamente por email.\n\n¿Necesitas algo mas?",
      delay: 800,
    };
  }

  // Catalogos genericos (catch-all cuando no es un producto especifico)
  if (lower.includes("office") || lower.includes("windows") || lower.includes("software") || lower.includes("licencia")) {
    return { text: catalog.software, delay: 1000 };
  }

  if (lower.includes("mesa") || lower.includes("gamer") || lower.includes("electrica")) {
    return { text: catalog.mesas, delay: 1000 };
  }

  // Default
  return {
    text: "Disculpa, no entendi tu mensaje. 😅\n\n¿En que te puedo ayudar?\n\n1️⃣ Ver software (Windows, Office)\n2️⃣ Ver mesas gamer\n3️⃣ Metodos de pago\n4️⃣ Guia de instalacion\n5️⃣ Hablar con un asesor",
    delay: 800,
  };
}

function getTime(): string {
  return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function SynovaTechBotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hola! 👋 Bienvenido a *SynovaTech PTY* - Soluciones Tecnologicas Integrales.\n\n¿En que te puedo ayudar hoy?\n\n1️⃣ Ver software (Windows, Office)\n2️⃣ Ver mesas gamer\n3️⃣ Metodos de pago\n4️⃣ Guia de instalacion\n5️⃣ Hablar con un asesor",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // "idle" | "software_payment" | "mesa_payment" | "mesa_delivery_choice" | "mesa_delivery_info" | "mesa_pickup_info"
  const [botState, setBotState] = useState<string>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendBotMessage(text: string, delay: number) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text, time: getTime() }]);
    }, delay);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const customerMsg: Message = { role: "customer", text: input.trim(), time: getTime() };
    const lower = input.toLowerCase().trim();
    setMessages((prev) => [...prev, customerMsg]);
    setInput("");

    // === ESTADO: Software ya mostro pago → transferir a asesor ===
    if (botState === "software_payment") {
      setBotState("idle");
      sendBotMessage("Gracias! 🙌 Te conecto con un asesor para confirmar tu pago y enviarte tu clave de inmediato.\n\nEn un momento te atendera. 👤\n\n[TRANSFERIR]", 800);
      return;
    }

    // === ESTADO: Mesa ya mostro producto → preguntar forma de pago y entrega ===
    if (botState === "mesa_payment") {
      setBotState("mesa_delivery_choice");
      sendBotMessage("Excelente eleccion! 🎉 ¿Como prefieres pagar y recibir tu mesa?\n\n1️⃣ *Pago contra entrega* - Te la llevamos a tu casa y pagas cuando la recibas (efectivo, Yappy o transferencia al momento)\n\n2️⃣ *Pago anticipado + envio* - Pagas primero por Yappy/ACH y te la enviamos gratis\n\n3️⃣ *Retiro en bodega* - Vas a recogerla y pagas directamente alla (El Dorado, Ciudad de Panama)", 1000);
      return;
    }

    // === ESTADO: Eligiendo forma de pago/entrega ===
    if (botState === "mesa_delivery_choice") {
      // Opcion 1: Pago contra entrega
      if (lower.includes("1") || lower.includes("contra entrega") || lower.includes("cuando llegue") || lower.includes("cuando reciba")) {
        setBotState("mesa_delivery_info");
        sendBotMessage("📦 *Pago contra entrega*\n\nTu mesa llega a tu puerta y pagas en el momento que la recibas. Puedes pagar en efectivo, Yappy o transferencia al recibir.\n\n🚚 *Horario de entregas:* Lunes, Miercoles y Viernes de 10:00am a 3:00pm.\n⚠️ Si necesitas otro dia u horario, lo coordinamos con anticipacion.\n\nPor favor envianos:\n\n📌 *Nombre completo y telefono*\n📍 *Direccion exacta* (ubicacion GPS de preferencia)\n📝 *Referencia del lugar*\n\nCon esa info programamos tu entrega. 🚚", 1000);
      }
      // Opcion 2: Pago anticipado
      else if (lower.includes("2") || lower.includes("anticipado") || lower.includes("antes") || lower.includes("pagar primero") || lower.includes("yappy") || lower.includes("transferencia")) {
        setBotState("mesa_delivery_info");
        sendBotMessage("📦 *Pago anticipado + envio gratis*\n\nRealiza tu pago y te enviamos la mesa sin costo adicional.\n\n💳 *Paga a:*\n📱 Yappy: 6043-4542 (Jorge Choy) o 6537-0196 (Daysi Torres)\n🏦 ACH: Banco General - Cuenta Ahorros - Jorge Choy - 0472984345786\n\n🚚 *Horario de entregas:* Lunes, Miercoles y Viernes de 10:00am a 3:00pm.\n\nEnvianos el comprobante de pago junto con:\n\n📌 *Nombre completo y telefono*\n📍 *Direccion exacta* (ubicacion GPS de preferencia)\n📝 *Referencia del lugar*", 1000);
      }
      // Opcion 3: Retiro en bodega
      else if (lower.includes("3") || lower.includes("retiro") || lower.includes("bodega") || lower.includes("recoger") || lower.includes("buscar") || lower.includes("ir")) {
        setBotState("mesa_pickup_info");
        sendBotMessage("🏢 *Retiro en bodega - 3Way Technology*\n📍 El Dorado, Ciudad de Panama\n🗺️ https://maps.app.goo.gl/4vEZ6hhfUtyG99qw9\n\n🕒 *Horario:*\n• Lunes a Viernes: 9:00am - 5:30pm\n• Sabados: 9:00am - 2:00pm\n\nPagas directamente en bodega al retirar tu mesa.\n\n⚠️ *MUY IMPORTANTE:* Al llegar, pregunta por *Angel Peña*. Si no preguntas por el, no se aplica el precio promocional.\n\nSolo envianos:\n\n👤 *Nombre de quien retira*\n🕐 *Hora estimada de llegada*\n\nAsi le avisamos a Angel para que te atienda. 👍", 1000);
      } else {
        sendBotMessage("Por favor indicanos como prefieres:\n\n1️⃣ *Pago contra entrega* (pagas al recibir)\n2️⃣ *Pago anticipado + envio* (pagas y te la enviamos)\n3️⃣ *Retiro en bodega* (vas a recogerla)", 600);
      }
      return;
    }

    // === ESTADO: Esperando datos de entrega → transferir ===
    if (botState === "mesa_delivery_info" || botState === "mesa_pickup_info") {
      setBotState("idle");
      sendBotMessage("Perfecto! 📝 Ya tenemos tus datos. Te conecto con un asesor para confirmar y coordinar todo.\n\nEn un momento te atendera. 👤\n\n[TRANSFERIR]", 800);
      return;
    }

    // === ESTADO NORMAL: procesar mensaje ===
    const response = getResponse(input);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: response.text, time: getTime() }]);
      // Detectar si mostro producto con datos de pago
      if (response.text.includes("Para comprar, paga") || response.text.includes("Envianos el comprobante")) {
        // Determinar si es mesa o software
        if (response.text.includes("coordinamos el envio")) {
          setBotState("mesa_payment");
        } else {
          setBotState("software_payment");
        }
      }
    }, response.delay);
  }

  function formatText(text: string) {
    return text.split("\n").map((line, i) => {
      // Bold *text*
      const formatted = line.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />;
    }).reduce((acc: React.ReactNode[], curr, i) => {
      if (i > 0) acc.push(<br key={`br-${i}`} />);
      acc.push(curr);
      return acc;
    }, []);
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">ST</div>
            <h1 className="text-xl font-bold text-white">SynovaTech <span className="text-cyan-400">Bot</span></h1>
          </div>
          <p className="text-gray-400 text-sm">Demo del bot de WhatsApp - Prueba escribir mensajes</p>
          <p className="text-gray-500 text-xs mt-1">Prueba: &quot;hola&quot;, &quot;1&quot;, &quot;office 2024&quot;, &quot;quiero comprar&quot;, &quot;mesas&quot;</p>
        </div>

        <div className="bg-gray-800 rounded-[2.5rem] p-3 shadow-2xl">
          <div className="bg-[#ECE5DD] rounded-[2rem] overflow-hidden flex flex-col" style={{ height: "600px" }}>
            {/* Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">ST</div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">SynovaTech PTY</p>
                <p className="text-green-200 text-xs">{isTyping ? "escribiendo..." : "en linea"}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "customer" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.role === "customer"
                      ? "bg-[#DCF8C6] text-gray-800"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}>
                    <div className="text-sm">{formatText(msg.text)}</div>
                    <p className="text-[10px] text-gray-500 text-right mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2 flex gap-2 bg-[#F0F0F0] shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 rounded-full bg-white text-sm outline-none text-gray-800"
                disabled={isTyping}
              />
              <button
                type="submit"
                className="w-10 h-10 bg-[#075E54] rounded-full flex items-center justify-center text-white shrink-0"
                disabled={isTyping}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
