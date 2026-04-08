"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "customer" | "bot";
  text: string;
  time: string;
}

const botResponses: Record<string, { text: string; delay: number }> = {
  default: {
    text: "Hola! 👋 Bienvenido a Taqueria El Patron. Soy tu asistente virtual.\n\n¿En que te puedo ayudar?\n\n1️⃣ Ver el menu\n2️⃣ Hacer un pedido\n3️⃣ Horarios y ubicacion\n4️⃣ Promociones del dia",
    delay: 800,
  },
  "1": {
    text: "🌮 *MENU TAQUERIA EL PATRON*\n\n🔥 TACOS:\n• Tacos al pastor (3 pzs) - $60\n• Tacos de bistec (3 pzs) - $75\n• Tacos de suadero (3 pzs) - $65\n• Tacos campechanos (3 pzs) - $70\n\n🫔 ESPECIALIDADES:\n• Gringa de pastor - $85\n• Quesadilla grande - $55\n• Volcanes (3 pzs) - $80\n\n🥤 BEBIDAS:\n• Agua fresca 1L - $35\n• Refresco - $25\n• Cerveza - $40\n\n¿Que te gustaria ordenar?",
    delay: 1200,
  },
  "2": {
    text: "Claro! Con gusto te tomo tu pedido. 📝\n\n¿Que te gustaria ordenar? Puedes decirme los productos y cantidades.\n\nPor ejemplo: \"Quiero 6 tacos al pastor y una agua de horchata\"",
    delay: 800,
  },
  "3": {
    text: "📍 *UBICACION Y HORARIOS*\n\nDireccion: Av. Insurgentes Sur #456, Col. Roma\n\n🕐 Horario:\n• Lunes a Jueves: 6pm - 2am\n• Viernes y Sabado: 6pm - 4am\n• Domingo: 5pm - 12am\n\n📞 Tel: (55) 9876-5432\n\n¿Te gustaria hacer un pedido para recoger o a domicilio?",
    delay: 1000,
  },
  "4": {
    text: "🔥 *PROMOCIONES DE HOY*\n\n🌮 Martes de Tacos: 2x1 en tacos al pastor\n🍺 Jueves Chelero: Cerveza a $25 con pedido\n📦 Pedidos mayores a $200: Envio GRATIS\n\n¿Quieres aprovechar alguna promo?",
    delay: 900,
  },
  pastor: {
    text: "Excelente eleccion! 🌮\n\nEntonces son tacos al pastor. ¿Cuantas ordenes? (Cada orden trae 3 tacos por $60).\n\n¿Quieres agregar algo mas a tu pedido?",
    delay: 800,
  },
  pedido: {
    text: "Perfecto! Tu pedido seria:\n\n📋 *RESUMEN:*\n• 6 Tacos al pastor - $120\n• 1 Agua de horchata 1L - $35\n\n💰 *Total: $155 MXN*\n\n🛵 Envio: $30 (gratis arriba de $200)\n\n💳 Metodos de pago: Efectivo, Tarjeta, Transferencia\n\n¿Es para recoger o a domicilio? 🏠",
    delay: 1200,
  },
  domicilio: {
    text: "Perfecto, sera a domicilio! 🛵\n\n¿Me compartes tu direccion completa por favor?\n\nY dime tu nombre para el pedido.",
    delay: 800,
  },
  direccion: {
    text: "Listo! ✅\n\n📋 *PEDIDO CONFIRMADO*\n• 6 Tacos al pastor\n• 1 Agua de horchata\n• Total: $155 + $30 envio = $185 MXN\n• Pago: Efectivo\n• Envio a: Tu direccion\n\n⏱ Tiempo estimado: 30-40 minutos\n\nTe enviaremos un mensaje cuando el repartidor salga. ¡Gracias por tu pedido! 🌮",
    delay: 1500,
  },
  agente: {
    text: "Entendido, te conecto con una persona de nuestro equipo. 👤\n\nEn un momento te atendera. Gracias por tu paciencia.",
    delay: 800,
  },
};

function getResponse(input: string): { text: string; delay: number } {
  const lower = input.toLowerCase().trim();

  if (lower === "1" || lower.includes("menu")) return botResponses["1"];
  if (lower === "2" || lower.includes("pedido") || lower.includes("ordenar")) return botResponses["2"];
  if (lower === "3" || lower.includes("horario") || lower.includes("ubicacion") || lower.includes("donde")) return botResponses["3"];
  if (lower === "4" || lower.includes("promo") || lower.includes("oferta") || lower.includes("descuento")) return botResponses["4"];
  if (lower.includes("pastor")) return botResponses["pastor"];
  if (lower.includes("quiero") && (lower.includes("taco") || lower.includes("agua"))) return botResponses["pedido"];
  if (lower.includes("domicilio") || lower.includes("casa") || lower.includes("envio")) return botResponses["domicilio"];
  if (lower.includes("calle") || lower.includes("col") || lower.includes("direccion") || lower.includes("av")) return botResponses["direccion"];
  if (lower.includes("agente") || lower.includes("persona") || lower.includes("humano")) return botResponses["agente"];

  return {
    text: "Disculpa, no entendi tu mensaje. ¿Puedes intentar de nuevo?\n\nEscribe:\n1️⃣ Ver el menu\n2️⃣ Hacer un pedido\n3️⃣ Horarios\n4️⃣ Promociones\n\nO escribe \"agente\" para hablar con una persona.",
    delay: 800,
  };
}

function getTime(): string {
  return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function BotWhatsAppDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: botResponses.default.text, time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const customerMsg: Message = { role: "customer", text: input.trim(), time: getTime() };
    setMessages((prev) => [...prev, customerMsg]);

    const response = getResponse(input);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: response.text, time: getTime() },
      ]);
    }, response.delay);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Demo: Bot de WhatsApp con IA</h1>
          <p className="text-gray-500 text-sm mt-1">Prueba escribiendo mensajes como si fueras un cliente</p>
          <p className="text-gray-400 text-xs mt-1">Prueba: &quot;1&quot;, &quot;quiero 6 tacos al pastor y agua de horchata&quot;, &quot;domicilio&quot;</p>
        </div>

        {/* Phone mockup */}
        <div className="bg-gray-800 rounded-[2.5rem] p-3 shadow-2xl">
          <div className="bg-[#ECE5DD] rounded-[2rem] overflow-hidden flex flex-col" style={{ height: "600px" }}>
            {/* Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-lg">🌮</div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Taqueria El Patron</p>
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
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
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
                className="flex-1 px-4 py-2 rounded-full bg-white text-sm outline-none"
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
