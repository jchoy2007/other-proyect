"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "customer" | "bot";
  text: string;
  time: string;
}

const catalog: Record<string, string> = {
  software: `💻 *CATALOGO DE SOFTWARE*\n⚡ Entrega inmediata por email y WhatsApp\n\n📦 *WINDOWS 11:*\n1️⃣ Win 11 Home OEM - $10.00\n2️⃣ Win 11 Home Retail - $15.00\n3️⃣ Win 11 Pro OEM - $12.00\n4️⃣ Win 11 Pro Retail - $17.00\n\n📦 *WINDOWS 10:*\n5️⃣ Win 10 Home OEM - $8.00\n6️⃣ Win 10 Pro OEM - $10.00\n\n📦 *MICROSOFT OFFICE (solo PC, no MAC):*\n7️⃣ Office Pro Plus 2016 - $10.00\n8️⃣ Office Pro Plus 2019 - $15.00\n9️⃣ Office Pro Plus 2021 - $25.00\n🔟 Office Pro Plus 2024 - $45.00\n\n📦 *WINDOWS SERVER:*\n1️⃣1️⃣ Server 2012 Standard - $12.00\n1️⃣2️⃣ Server 2019 Standard - $15.00\n1️⃣3️⃣ Server 2019 Datacenter - $25.00\n1️⃣4️⃣ Server 2022 Datacenter - $30.00\n1️⃣5️⃣ Server 2025 Standard - $25.00\n1️⃣6️⃣ Server 2025 Datacenter - $35.00\n\n👉 *Escoge el número del producto que te interesa* o escribe el nombre.`,
  mesas: `🖥️ *MESAS GAMER Y ELECTRICAS*\n🚚 Envio GRATIS en Ciudad de Panamá\n\n🎮 *MESAS GAMER:*\n1️⃣ Mesa S1-Y (LED) 140x60cm - $90\n2️⃣ Mesa R5-7 140x60cm - $95\n3️⃣ Mesa Z5-6 140x60cm - $95\n4️⃣ Mesa H2 (LED) 140x60cm - $110\n5️⃣ Mesa S2 Reversible "L" 190x60cm - $125\n\n⚡ *MESAS ELECTRICAS AJUSTABLES:*\n6️⃣ Electrica Negra 140x60cm - $130\n7️⃣ Electrica Blanca 140x60cm - $130\n8️⃣ S60 Motor+LED 140x60cm - $145\n\n👉 *Escoge el número de la mesa que te interesa* o escribe el nombre.`,
  pago: `💳 *METODOS DE PAGO:*\n\n📱 *Yappy:*\n• 6043-4542 (Jorge Choy)\n• 6537-0196 (Daysi Torres)\n\n🏦 *ACH / Transferencia:*\n• Banco General\n• Cuenta de Ahorros\n• Jorge Choy\n• Cuenta: 0472984345786\n\nDespues de pagar, envíanos el comprobante por aqui y procesamos tu pedido de inmediato. ✅`,
  instalacion_windows: `🔧 *GUIA DE INSTALACION - WINDOWS:*\n\n1️⃣ Descargar la herramienta de creacion de medios de Microsoft\n2️⃣ Crear USB booteable\n3️⃣ Instalar Windows desde el USB\n4️⃣ Activar con la clave que te enviamos\n\n💡 Si necesitas ayuda, ofrecemos *instalación remota gratuita*. Solo dinos y nos conectamos a tu PC para ayudarte.`,
  instalacion_office_2024: `🔧 *GUIA DE INSTALACION - OFFICE 2024:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el instalador:\n👉 https://softkeypc.com/wp-content/uploads/2024/12/Office_2024_ES_64Bits.exe\n2️⃣ Ejecuta el archivo descargado\n3️⃣ Sigue las instrucciones de instalacion\n4️⃣ Activa con tu clave al abrir Word, Excel o PowerPoint\n\n💡 Si necesitas ayuda, ofrecemos *instalación remota gratuita*.`,
  instalacion_office_2021: `🔧 *GUIA DE INSTALACION - OFFICE 2021:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el archivo .IMG:\n👉 https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/es-es/ProPlus2021Retail.img\n2️⃣ Clic derecho > Montar (o extraer con WinRAR)\n3️⃣ Ejecuta setup.exe\n4️⃣ Activa con tu clave al abrir cualquier app de Office\n\n💡 Si necesitas ayuda, ofrecemos *instalación remota gratuita*.`,
  instalacion_office_2019: `🔧 *GUIA DE INSTALACION - OFFICE 2019:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el archivo .IMG:\n👉 https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/es-es/ProPlus2019Retail.img\n2️⃣ Clic derecho > Montar (o extraer con WinRAR)\n3️⃣ Ejecuta setup.exe\n4️⃣ Activa con tu clave al abrir cualquier app de Office\n\n💡 Si necesitas ayuda, ofrecemos *instalación remota gratuita*.`,
  instalacion_office_2016: `🔧 *GUIA DE INSTALACION - OFFICE 2016:*\n⚠️ *Solo para PC (no compatible con MAC)*\n\n1️⃣ Descarga el archivo .IMG:\n👉 https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/es-es/ProPlusRetail.img\n2️⃣ Clic derecho > Montar (o extraer con WinRAR)\n3️⃣ Ejecuta setup.exe\n4️⃣ Activa con tu clave al abrir cualquier app de Office\n\n💡 Si necesitas ayuda, ofrecemos *instalación remota gratuita*.`,
  oem_retail: `📋 *DIFERENCIA OEM vs RETAIL:*\n\n🔹 *OEM:* Licencia vinculada a 1 PC. No se puede transferir a otro equipo. Es mas economica.\n\n🔹 *Retail:* Licencia transferible. Si cambias de PC, puedes mover tu licencia al nuevo equipo.\n\n💡 Si tu PC es fijo y no piensas cambiarlo pronto, OEM es la mejor opcion. Si cambias de equipo seguido, Retail es mejor inversion.\n\n¿Te ayudo a elegir?`,
};

// Software products mapped by number
const SW: Record<string, { name: string; price: string; extra: string; keywords: string[] }> = {
  "1":  { name: "Windows 11 Home OEM", price: "$10.00", extra: "Activación permanente - 1 PC (no transferible).", keywords: ["11 home oem"] },
  "2":  { name: "Windows 11 Home Retail", price: "$15.00", extra: "Activación permanente - Transferible a otro PC.", keywords: ["11 home retail"] },
  "3":  { name: "Windows 11 Pro OEM", price: "$12.00", extra: "Activación permanente - 1 PC (no transferible).\nBitLocker, Hyper-V, Remote Desktop.", keywords: ["11 pro oem"] },
  "4":  { name: "Windows 11 Pro Retail", price: "$17.00", extra: "Activación permanente - Transferible a otro PC.\nBitLocker, Hyper-V, Remote Desktop.", keywords: ["11 pro retail"] },
  "5":  { name: "Windows 10 Home OEM", price: "$8.00", extra: "Activación permanente - 1 PC.", keywords: ["10 home"] },
  "6":  { name: "Windows 10 Pro OEM", price: "$10.00", extra: "Activación permanente - 1 PC.\nBitLocker, Remote Desktop.", keywords: ["10 pro"] },
  "7":  { name: "Office Pro Plus 2016", price: "$10.00", extra: "⚠️ Solo para PC (no MAC).\nWord, Excel, PowerPoint, Outlook, Access, Publisher.", keywords: ["office 2016", "2016"] },
  "8":  { name: "Office Pro Plus 2019", price: "$15.00", extra: "⚠️ Solo para PC (no MAC).\nWord, Excel, PowerPoint, Outlook, Access, Publisher.", keywords: ["office 2019", "2019"] },
  "9":  { name: "Office Pro Plus 2021", price: "$25.00", extra: "⚠️ Solo para PC (no MAC).\nWord, Excel, PowerPoint, Outlook, Access, Publisher, Teams.", keywords: ["office 2021", "2021"] },
  "10": { name: "Office Pro Plus 2024", price: "$45.00", extra: "⚠️ Solo para PC (no MAC).\nWord, Excel, PowerPoint, Outlook, Access, Publisher, Teams + IA.", keywords: ["office 2024", "2024"] },
  "11": { name: "Server 2012 Standard", price: "$12.00", extra: "Activación permanente.", keywords: ["server 2012", "2012"] },
  "12": { name: "Server 2019 Standard", price: "$15.00", extra: "Activación permanente. Hyper-V.", keywords: ["server 2019 standard"] },
  "13": { name: "Server 2019 Datacenter", price: "$25.00", extra: "Activación permanente. Virtualización ilimitada.", keywords: ["server 2019 datacenter", "2019 datacenter"] },
  "14": { name: "Server 2022 Datacenter", price: "$30.00", extra: "Activación permanente. Virtualización ilimitada + Azure.", keywords: ["server 2022", "2022"] },
  "15": { name: "Server 2025 Standard", price: "$25.00", extra: "Activación permanente. Soporte extendido.", keywords: ["server 2025 standard"] },
  "16": { name: "Server 2025 Datacenter", price: "$35.00", extra: "Activación permanente. Virtualización ilimitada.", keywords: ["server 2025 datacenter", "2025 datacenter"] },
};

const MESA_MAP: Record<string, { name: string; price: string; dims: string; extra: string; keywords: string[] }> = {
  "m1": { name: "Mesa Gamer S1-Y (con LED)", price: "$90.00", dims: "140x60x73cm", extra: "Luces LED, acero, superficie antideslizante.", keywords: ["s1-y", "s1 y", "s1y", "s1"] },
  "m2": { name: "Mesa Gamer R5-7", price: "$95.00", dims: "140x60x73cm", extra: "Acero reforzado, superficie amplia, ergonomica.", keywords: ["r5-7", "r5 7", "r57", "r5"] },
  "m3": { name: "Mesa Gamer Z5-6", price: "$95.00", dims: "140x60x73cm", extra: "Diseno en Z, acero, superficie antideslizante.", keywords: ["z5-6", "z5 6", "z56", "z5"] },
  "m4": { name: "Mesa Gamer H2 (con LED)", price: "$110.00", dims: "140x60x73cm", extra: "Luces LED integradas, acero, antideslizante.", keywords: ["h2"] },
  "m5": { name: 'Mesa Gamer S2 Reversible ("L" o recta)', price: "$125.00", dims: "190x60x73cm", extra: 'Forma "L" o recta. La mas grande. Ideal para multiples monitores.', keywords: ["s2", "forma l", "reversible"] },
  "m6": { name: "Mesa Electrica Ajustable Negra", price: "$130.00", dims: "140x60x81-118cm", extra: "Motor electrico de ajuste de altura. Color negro.", keywords: ["electrica negra", "ajustable negra", "negra"] },
  "m7": { name: "Mesa Electrica Ajustable Blanca", price: "$130.00", dims: "140x60x81-118cm", extra: "Motor electrico de ajuste de altura. Color blanco.", keywords: ["electrica blanca", "ajustable blanca", "blanca"] },
  "m8": { name: "Mesa Electrica S60 Motor+LED", price: "$145.00", dims: "140x60x81-118cm", extra: "Motor electrico + luces LED. La mas completa!", keywords: ["s60", "motor", "motor led"] },
};

const PAGO_INFO = "📱 Yappy: 6043-4542 (Jorge Choy) o 6537-0196 (Daysi Torres)\n🏦 ACH: Banco General - Cta Ahorros - Jorge Choy - 0472984345786";

function makeSoftwareResponse(sw: typeof SW[string]): { text: string; delay: number } {
  return {
    text: `📦 *${sw.name}*\nPrecio: *${sw.price}*\n\nLicencia original Microsoft.\n${sw.extra}\n\n⚡ *Entrega inmediata* por email y WhatsApp.\n\n💳 *Para comprar, paga ${sw.price} a:*\n${PAGO_INFO}\n\n📩 Envíanos el comprobante por aqui y te mandamos tu clave al instante.`,
    delay: 1000,
  };
}

function makeMesaResponse(m: typeof MESA_MAP[string]): { text: string; delay: number; _mesa: boolean } {
  return {
    text: `🖥️ *${m.name}*\nPrecio: *${m.price}*\nDimensiones: ${m.dims}\n\n${m.extra}\n\n¿Cómo deseas recibirla? Escoge el número:\n\n1️⃣ *Pago contra entrega* - Te la llevamos y pagas al recibirla\n2️⃣ *Pago anticipado + envío* - Pagas primero y te la enviamos gratis\n3️⃣ *Retiro en bodega* - Vas a recogerla y pagas allá (El Dorado)\n4️⃣ *Envío al interior* - Se paga antes, llega por Red Servi en 2 días`,
    delay: 1000, _mesa: true,
  };
}

function findSoftware(lower: string): typeof SW[string] | null {
  // Solo busca por keywords, no por número (números se manejan por estado)
  for (const sw of Object.values(SW)) {
    for (const kw of sw.keywords) { if (lower.includes(kw)) return sw; }
  }
  return null;
}

function findMesa(lower: string): typeof MESA_MAP[string] | null {
  // Solo busca por keywords, no por número
  for (const m of Object.values(MESA_MAP)) {
    for (const kw of m.keywords) { if (lower.includes(kw)) return m; }
  }
  return null;
}

function getResponse(input: string): { text: string; delay: number; _mesa?: boolean } {
  const lower = input.toLowerCase().trim();

  // Saludos
  if (lower.match(/^(hola|hi|buenos|buenas|hey|que tal|saludos)/)) {
    return {
      text: "Hola! 👋 Bienvenido a *SynovaTech PTY* - Soluciones Tecnológicas Integrales.\n\n¿En qué te puedo ayudar? Escoge un número:\n\n1️⃣ Ver software (Windows, Office)\n2️⃣ Ver mesas gamer\n3️⃣ Métodos de pago\n4️⃣ Guía de instalación\n5️⃣ Hablar con un asesor",
      delay: 800,
    };
  }

  // Pagos (solo por keyword, "3" se maneja por estado de menú)
  if (lower.includes("pago") || lower.includes("yappy") || lower.includes("ach") || lower.includes("transferencia") || lower.includes("pagar")) {
    return { text: catalog.pago, delay: 800 };
  }

  // Instalacion Windows -> transferir a asesor
  if ((lower.includes("instalar") || lower.includes("instalacion") || lower.includes("descargar") || lower.includes("descarga")) && (lower.includes("windows") || lower.includes("win 10") || lower.includes("win 11"))) {
    return {
      text: "La instalacion de Windows requiere atención personalizada para asegurarnos de que todo quede perfecto. 💻\n\nTe voy a conectar con un asesor que te guiara paso a paso o se conectara remotamente a tu PC para hacerlo por ti. *Sin costo adicional.*\n\nEn un momento te atenderá. 👤\n\n[TRANSFERIR]",
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

  // Instalacion general (por keyword, "4" se maneja por estado)
  if (lower.includes("instalacion") || lower.includes("instalar") || lower.includes("activar") || lower.includes("guia") || lower.includes("descargar") || lower.includes("descarga")) {
    return {
      text: "¿Para que producto necesitas la guía de instalación?\n\n1️⃣ Windows (10 u 11) → Te conectamos con un asesor\n2️⃣ Office 2016\n3️⃣ Office 2019\n4️⃣ Office 2021\n5️⃣ Office 2024\n\n⚠️ Los Office son *solo para PC* (no compatibles con MAC).\n\n💡 Para Windows, un asesor te ayuda personalmente o se conecta a tu PC de forma remota sin costo.",
      delay: 800,
    };
  }

  // Agente (por keyword, "5" se maneja por estado)
  if (lower.includes("asesor") || lower.includes("persona") || lower.includes("humano") || lower.includes("agente")) {
    return {
      text: "Te conecto con un asesor de nuestro equipo. 👤\n\nEn un momento te atenderá. Gracias por tu paciencia.\n\n[TRANSFERIR]",
      delay: 800,
    };
  }

  // OEM vs Retail
  if ((lower.includes("diferencia") || lower === "oem" || lower === "retail") && !lower.includes("win") && !lower.includes("pro") && !lower.includes("home")) {
    return { text: catalog.oem_retail, delay: 900 };
  }

  // Win 11 Pro sin especificar
  if ((lower.includes("windows 11 pro") || lower.includes("win 11 pro")) && !lower.includes("oem") && !lower.includes("retail")) {
    return { text: "📦 *Windows 11 Pro* - 2 opciones:\n\n3️⃣ *OEM* (1 PC, no transferible): *$12.00*\n4️⃣ *Retail* (transferible): *$17.00*\n\n💡 *OEM* si no cambias de PC. *Retail* si cambias seguido.\n\n👉 Escoge *3* o *4*.", delay: 900 };
  }

  // Win 11 Home sin especificar
  if ((lower.includes("windows 11 home") || lower.includes("win 11 home")) && !lower.includes("oem") && !lower.includes("retail")) {
    return { text: "📦 *Windows 11 Home* - 2 opciones:\n\n1️⃣ *OEM* (1 PC, no transferible): *$10.00*\n2️⃣ *Retail* (transferible): *$15.00*\n\n👉 Escoge *1* o *2*.", delay: 900 };
  }

  // === PRODUCTOS POR NUMERO O KEYWORD ===
  const foundSw = findSoftware(lower);
  if (foundSw) return makeSoftwareResponse(foundSw);

  const foundMesa = findMesa(lower);
  if (foundMesa) return makeMesaResponse(foundMesa);

  // Server generico
  if (lower.includes("server")) {
    return { text: "📦 *WINDOWS SERVER:*\n\n1️⃣1️⃣ Server 2012 Standard - *$12.00*\n1️⃣2️⃣ Server 2019 Standard - *$15.00*\n1️⃣3️⃣ Server 2019 Datacenter - *$25.00*\n1️⃣4️⃣ Server 2022 Datacenter - *$30.00*\n1️⃣5️⃣ Server 2025 Standard - *$25.00*\n1️⃣6️⃣ Server 2025 Datacenter - *$35.00*\n\n👉 Escoge el número.", delay: 900 };
  }

  // Comprar generico
  if (lower.includes("comprar") || lower.includes("quiero") || lower.includes("lo quiero")) {
    return { text: "¿Qué te interesa? Escoge:\n\n1️⃣ Ver *software* (Windows, Office)\n2️⃣ Ver *mesas gamer*\n\n👉 Escoge el número.", delay: 800 };
  }

  // Envio
  if (lower.includes("envio") || lower.includes("enviar") || lower.includes("entrega") || lower.includes("red servi")) {
    return { text: "📦 *ENVIOS:*\n\n💻 *Software:* Entrega *inmediata* por email y WhatsApp.\n\n🖥️ *Mesas en Panamá capital:* Envio gratis. L/Mi/V 10am-3pm.\n\n🚚 *Mesas al interior:* Por Red Servi, se paga antes. Entrega en 2 días hábiles directo en tu residencia.\n\n¿Algo más?", delay: 900 };
  }

  // Garantia
  if (lower.includes("garantia") || lower.includes("original") || lower.includes("legal")) {
    return { text: "🛡️ Todas nuestras licencias son *100% originales de Microsoft*.\n\n• Activación permanente (de por vida)\n• Funcionan con actualizaciones\n• Soporte de instalación incluido\n• Cualquier problema, lo resolvemos sin costo\n\n¿Algo más?", delay: 900 };
  }

  // Factura / cotización
  if (lower.includes("factura") || lower.includes("cotización") || lower.includes("cotización") || lower.includes("recibo")) {
    return { text: "🧾 Al momento de tu pedido te generamos una *cotización*. Una vez confirmado tu pago, se genera la *factura oficial* y te la enviamos por email.\n\n¿Algo más?", delay: 800 };
  }

  // Catalogos genericos (por keyword, números se manejan por estado)
  if (lower === "software" || lower === "licencia" || lower === "licencias" || lower.includes("office") || lower.includes("windows")) {
    return { text: catalog.software, delay: 1000 };
  }
  if (lower === "mesas" || lower === "mesa" || lower === "escritorio" || lower.includes("gamer") || lower.includes("electrica")) {
    return { text: catalog.mesas, delay: 1000 };
  }

  // Default
  return {
    text: "No logré identificar tu solicitud. 😅\n\nPuedes decirme el *número de la opción* que deseas y te ayudo de inmediato:\n\n1️⃣ Ver software (Windows, Office)\n2️⃣ Ver mesas gamer\n3️⃣ Métodos de pago\n4️⃣ Guía de instalación\n5️⃣ Hablar con un asesor\n\n👉 Solo escribe el número.",
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
      text: "Hola! 👋 Bienvenido a *SynovaTech PTY* - Soluciones Tecnológicas Integrales.\n\n¿En qué te puedo ayudar hoy?\n\n1️⃣ Ver software (Windows, Office)\n2️⃣ Ver mesas gamer\n3️⃣ Métodos de pago\n4️⃣ Guía de instalación\n5️⃣ Hablar con un asesor",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // "idle" | "menu" | "software_catalog" | "mesa_catalog" | "software_payment" | "mesa_payment" | "mesa_delivery_choice" | "mesa_delivery_info" | "mesa_pickup_info"
  const [botState, setBotState] = useState<string>("menu");
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

    // === ESTADO: Software mostró datos de pago → pedir comprobante ===
    if (botState === "software_payment") {
      if (lower.includes("pagu") || lower.includes("pagué") || lower.includes("pague") || lower.includes("listo") || lower.includes("enviado") || lower.includes("comprobante") || lower.includes("transferi") || lower.includes("transferí") || lower.includes("foto") || lower.includes("captura") || lower.includes("si") || lower.includes("sí")) {
        setBotState("idle");
        sendBotMessage("¡Gracias! 🙌 Te conecto con un asesor para verificar tu pago y enviarte tu clave de inmediato.\n\nEn un momento te atenderá. 👤\n\n[TRANSFERIR]", 800);
      } else {
        sendBotMessage("Para procesar tu compra, por favor:\n\n📸 *Envíanos una foto del comprobante de pago*\n\nO si ya pagaste, escríbenos *\"ya pagué\"* y te conectamos con un asesor para enviarte tu clave al instante. ⚡", 800);
      }
      return;
    }

    // === ESTADO: Mesa ya mostro producto → preguntar forma de pago y entrega ===
    if (botState === "mesa_payment") {
      setBotState("mesa_delivery_choice");
      sendBotMessage("Excelente elección! 🎉 ¿Cómo prefieres pagar y recibir tu mesa? Escoge el número:\n\n1️⃣ *Pago contra entrega* - Te la llevamos y pagas cuando la recibas\n2️⃣ *Pago anticipado + envío* - Pagas primero y te la enviamos gratis\n3️⃣ *Retiro en bodega* - Vas a recogerla y pagas allá (El Dorado)\n4️⃣ *Envío al interior del país* - Se paga antes, llega por Red Servi", 1000);
      return;
    }

    // === ESTADO: Eligiendo forma de pago/entrega ===
    if (botState === "mesa_delivery_choice") {
      // Opcion 1: Pago contra entrega
      if (lower === "1" || lower.includes("contra entrega") || lower.includes("cuando llegue") || lower.includes("cuando reciba")) {
        setBotState("mesa_delivery_info");
        sendBotMessage("📦 *Pago contra entrega*\n\nTu mesa llega a tu puerta y pagas en el momento que la recibas. Puedes pagar en efectivo, Yappy o transferencia al momento de recibir.\n\n🚚 *Horario de entregas:* Lunes, Miércoles y Viernes de 10:00am a 3:00pm.\n⚠️ Otro día u horario se coordina con anticipación.\n\nPor favor envíanos:\n\n📌 *Nombre completo y teléfono*\n📍 *Dirección exacta* (ubicación GPS de preferencia)\n📝 *Referencia del lugar*\n\nCon esa info programamos tu entrega. 🚚", 1000);
      }
      // Opcion 2: Pago anticipado
      else if (lower === "2" || lower.includes("anticipado") || lower.includes("antes") || lower.includes("pagar primero")) {
        setBotState("mesa_delivery_info");
        sendBotMessage("📦 *Pago anticipado + envío gratis*\n\nRealiza tu pago y te enviamos la mesa sin costo adicional.\n\n💳 *Paga a:*\n📱 Yappy: 6043-4542 (Jorge Choy) o 6537-0196 (Daysi Torres)\n🏦 ACH: Banco General - Cta Ahorros - Jorge Choy - 0472984345786\n\n🚚 *Entregas:* L/Mi/V de 10:00am a 3:00pm.\n\nEnvíanos el comprobante junto con:\n\n📌 *Nombre completo y teléfono*\n📍 *Dirección exacta* (ubicación GPS)\n📝 *Referencia del lugar*", 1000);
      }
      // Opcion 3: Retiro en bodega
      else if (lower === "3" || lower.includes("retiro") || lower.includes("bodega") || lower.includes("recoger") || lower.includes("buscar")) {
        setBotState("mesa_pickup_info");
        sendBotMessage("🏢 *Retiro en bodega - 3Way Technology*\n📍 El Dorado, Ciudad de Panamá\n🗺️ https://maps.app.goo.gl/4vEZ6hhfUtyG99qw9\n\n🕒 *Horario:*\n• Lunes a Viernes: 9:00am - 5:30pm\n• Sábados: 9:00am - 2:00pm\n\nPagas directamente en bodega al retirar.\n\n⚠️ *MUY IMPORTANTE:* Al llegar, pregunta por *Ángel Peña*. Si no preguntas por él, no se aplica el precio promocional.\n\nSolo envíanos:\n\n👤 *Nombre de quien retira*\n🕐 *Hora estimada de llegada*\n\nAsí le avisamos a Ángel para que te espere. 👍", 1000);
      }
      // Opcion 4: Envio al interior
      else if (lower === "4" || lower.includes("interior") || lower.includes("provincia")) {
        setBotState("mesa_delivery_info");
        sendBotMessage("🚚 *Envío al interior del país*\n\nPara envíos fuera de Ciudad de Panamá, es necesario realizar el pago antes del despacho.\n\n📦 El envío se realiza por *Red Servi* y llega en aproximadamente *2 días hábiles* directamente a tu residencia.\n\n💳 *Paga a:*\n📱 Yappy: 6043-4542 (Jorge Choy) o 6537-0196 (Daysi Torres)\n🏦 ACH: Banco General - Cta Ahorros - Jorge Choy - 0472984345786\n\nEnvíanos el comprobante junto con:\n\n📌 *Nombre completo y teléfono*\n📍 *Dirección exacta, provincia y distrito*\n📝 *Referencia del lugar*\n\nUna vez confirmado el pago, despachamos tu mesa. 📦", 1000);
      } else {
        sendBotMessage("Por favor escoge el *número* de la opción que prefieres:\n\n1️⃣ Pago contra entrega\n2️⃣ Pago anticipado + envío\n3️⃣ Retiro en bodega\n4️⃣ Envío al interior del país\n\n👉 Solo escribe el número.", 600);
      }
      return;
    }

    // === ESTADO: Esperando datos de entrega → transferir ===
    if (botState === "mesa_delivery_info" || botState === "mesa_pickup_info") {
      setBotState("idle");
      sendBotMessage("Perfecto! 📝 Ya tenemos tus datos. Te conecto con un asesor para confirmar y coordinar todo.\n\nEn un momento te atenderá. 👤\n\n[TRANSFERIR]", 800);
      return;
    }

    // === ESTADO: Menu principal - números 1-5 navegan ===
    if (botState === "menu" || botState === "idle") {
      if (lower === "1") {
        setBotState("software_catalog");
        sendBotMessage(catalog.software, 1000);
        return;
      }
      if (lower === "2") {
        setBotState("mesa_catalog");
        sendBotMessage(catalog.mesas, 1000);
        return;
      }
      if (lower === "3") {
        sendBotMessage(catalog.pago, 800);
        return;
      }
      if (lower === "4") {
        sendBotMessage("¿Para qué producto necesitas la guía? Escoge un número:\n\n1️⃣ Windows (10 u 11) → Te conectamos con un asesor\n2️⃣ Office 2016\n3️⃣ Office 2019\n4️⃣ Office 2021\n5️⃣ Office 2024\n\n⚠️ Los Office son *solo para PC* (no MAC).\n💡 Para Windows, un asesor te ayuda o se conecta a tu PC sin costo.", 800);
        return;
      }
      if (lower === "5") {
        sendBotMessage("Te conecto con un asesor de nuestro equipo. 👤\n\nEn un momento te atenderáá. Gracias por tu paciencia.\n\n[TRANSFERIR]", 800);
        return;
      }
    }

    // === ESTADO: Catálogo software - números seleccionan producto ===
    if (botState === "software_catalog") {
      const sw = SW[lower];
      if (sw) {
        setBotState("software_payment");
        sendBotMessage(makeSoftwareResponse(sw).text, 1000);
        return;
      }
      // Si escribe "2" quiere ver mesas
      if (lower === "2") {
        setBotState("mesa_catalog");
        sendBotMessage(catalog.mesas, 1000);
        return;
      }
    }

    // === ESTADO: Catálogo mesas - números seleccionan mesa ===
    if (botState === "mesa_catalog") {
      const mesaKey = `m${lower}`;
      const mesa = MESA_MAP[mesaKey];
      if (mesa) {
        setBotState("mesa_delivery_choice");
        sendBotMessage(makeMesaResponse(mesa).text, 1000);
        return;
      }
      // Si escribe "1" quiere ver software
      if (lower === "1") {
        setBotState("software_catalog");
        sendBotMessage(catalog.software, 1000);
        return;
      }
    }

    // === ESTADO NORMAL: procesar por keywords ===
    const response = getResponse(input);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: response.text, time: getTime() }]);
      // Detectar contexto de la respuesta
      if (response._mesa) {
        setBotState("mesa_delivery_choice");
      } else if (response.text.includes("Para comprar, paga") || response.text.includes("Envíanos el comprobante")) {
        setBotState("software_payment");
      } else if (response.text.includes("Escoge el número del producto")) {
        setBotState("software_catalog");
      } else if (response.text.includes("Escoge el número de la mesa")) {
        setBotState("mesa_catalog");
      } else if (response.text.includes("¿En qué te puedo ayudar")) {
        setBotState("menu");
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
