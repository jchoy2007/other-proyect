"use client";

import { useState } from "react";

interface Conversation {
  customerPhone: string;
  messages: { role: string; content: string; timestamp: string }[];
  status: string;
  lastMessageAt: string;
}

interface Stats {
  totalConversations: number;
  activeConversations: number;
  messagesProcessed: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "conversations" | "settings"
  >("dashboard");

  // Demo data for presentation
  const stats: Stats = {
    totalConversations: 156,
    activeConversations: 12,
    messagesProcessed: 2847,
  };

  const conversations: Conversation[] = [
    {
      customerPhone: "+52 55 1234 5678",
      messages: [
        {
          role: "customer",
          content: "Hola, quiero hacer un pedido",
          timestamp: "2026-04-08T10:30:00Z",
        },
        {
          role: "bot",
          content:
            "Hola! Bienvenido. Aqui esta nuestro menu del dia. Que te gustaria ordenar?",
          timestamp: "2026-04-08T10:30:02Z",
        },
        {
          role: "customer",
          content: "2 hamburguesas clasicas",
          timestamp: "2026-04-08T10:31:00Z",
        },
        {
          role: "bot",
          content:
            "Perfecto! 2 hamburguesas clasicas = $178 MXN. Cual es tu direccion para el envio?",
          timestamp: "2026-04-08T10:31:03Z",
        },
      ],
      status: "active",
      lastMessageAt: "2026-04-08T10:31:03Z",
    },
    {
      customerPhone: "+52 33 9876 5432",
      messages: [
        {
          role: "customer",
          content: "Que horarios manejan?",
          timestamp: "2026-04-08T09:15:00Z",
        },
        {
          role: "bot",
          content:
            "Nuestro horario es de Lunes a Sabado de 9am a 10pm. Los domingos de 10am a 6pm. Te esperamos!",
          timestamp: "2026-04-08T09:15:02Z",
        },
      ],
      status: "closed",
      lastMessageAt: "2026-04-08T09:15:02Z",
    },
    {
      customerPhone: "+52 81 5555 1234",
      messages: [
        {
          role: "customer",
          content: "Quiero reservar una mesa para 4 personas",
          timestamp: "2026-04-08T11:00:00Z",
        },
        {
          role: "bot",
          content:
            "Con gusto! Para cuando seria la reservacion y a que hora te gustaria llegar?",
          timestamp: "2026-04-08T11:00:02Z",
        },
        {
          role: "customer",
          content: "Para hoy a las 8pm",
          timestamp: "2026-04-08T11:01:00Z",
        },
        {
          role: "bot",
          content:
            "Listo! Reservacion confirmada: 4 personas, hoy a las 8:00 PM. Te esperamos! Si necesitas cancelar, solo escribenos.",
          timestamp: "2026-04-08T11:01:03Z",
        },
      ],
      status: "active",
      lastMessageAt: "2026-04-08T11:01:03Z",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-gray-900 min-h-screen p-6 hidden lg:block">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Bot<span className="text-green-500">Ventas</span>
            </span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("conversations")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                activeTab === "conversations"
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Conversaciones
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                activeTab === "settings"
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Configuracion
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-10">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg" />
            <span className="text-lg font-bold">
              Bot<span className="text-green-500">Ventas</span>
            </span>
          </div>

          {activeTab === "dashboard" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">
                Dashboard
              </h1>

              {/* Stats cards */}
              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">
                    Conversaciones Totales
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalConversations}
                  </p>
                  <p className="text-sm text-green-600 mt-2">+12% vs ayer</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Activas Ahora</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">
                    {stats.activeConversations}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm text-gray-500">En tiempo real</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Mensajes Procesados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.messagesProcessed.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-2">+8% vs ayer</p>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Actividad Reciente
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {conversations.map((conv, i) => (
                    <div
                      key={i}
                      className="p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            conv.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {conv.customerPhone.slice(-2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {conv.customerPhone}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {
                              conv.messages[conv.messages.length - 1]
                                .content
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            conv.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {conv.status === "active" ? "Activa" : "Cerrada"}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.lastMessageAt).toLocaleTimeString(
                            "es",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "conversations" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">
                Conversaciones
              </h1>
              <div className="space-y-4">
                {conversations.map((conv, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {conv.customerPhone.slice(-2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {conv.customerPhone}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conv.messages.length} mensajes
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          conv.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {conv.status === "active" ? "Activa" : "Cerrada"}
                      </span>
                    </div>

                    <div className="bg-[#ECE5DD] rounded-lg p-4 space-y-2">
                      {conv.messages.map((msg, j) => (
                        <div
                          key={j}
                          className={`flex ${
                            msg.role === "customer"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              msg.role === "customer"
                                ? "bg-[#DCF8C6] text-gray-800"
                                : "bg-white text-gray-800 shadow-sm"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className="text-[10px] text-gray-500 text-right mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString(
                                "es",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">
                Configuracion del Bot
              </h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del negocio
                    </label>
                    <input
                      type="text"
                      defaultValue="Mi Restaurante"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje de bienvenida
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Hola! Bienvenido a Mi Restaurante. En que te puedo ayudar?"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Informacion del negocio (el bot usara esto para responder)
                    </label>
                    <textarea
                      rows={6}
                      defaultValue="Somos un restaurante de comida mexicana. Nuestro horario es de Lunes a Sabado de 9am a 10pm. Hacemos envios a domicilio con costo de $30. Aceptamos efectivo, tarjeta y transferencia."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje fuera de horario
                    </label>
                    <textarea
                      rows={2}
                      defaultValue="Gracias por escribirnos. En este momento estamos cerrados. Te responderemos en cuanto abramos."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none resize-none"
                    />
                  </div>
                  <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
