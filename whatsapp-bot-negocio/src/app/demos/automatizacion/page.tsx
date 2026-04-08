"use client";

import { useState } from "react";

export default function AutomatizacionDemo() {
  const [activeAutomation, setActiveAutomation] = useState<number | null>(null);

  const automations = [
    {
      name: "Respuesta Automatica a Emails",
      status: "active",
      icon: "📧",
      description: "Lee emails entrantes, clasifica por urgencia y genera respuestas automaticas con IA",
      stats: { processed: 234, saved: "12hrs", accuracy: "96%" },
      log: [
        { time: "10:32", action: "Email recibido de cliente@empresa.com", result: "Clasificado: Cotizacion - Urgencia: Alta" },
        { time: "10:32", action: "IA genero respuesta con cotizacion adjunta", result: "Enviada automaticamente" },
        { time: "10:15", action: "Email recibido de proveedor@mail.com", result: "Clasificado: Factura - Urgencia: Normal" },
        { time: "10:15", action: "Factura extraida y registrada en sistema", result: "Reenviada a contabilidad" },
      ],
    },
    {
      name: "Generador de Reportes Diarios",
      status: "active",
      icon: "📊",
      description: "Cada dia a las 8am genera un reporte de ventas, inventario y KPIs automaticamente",
      stats: { processed: 30, saved: "4hrs/dia", accuracy: "100%" },
      log: [
        { time: "08:00", action: "Recolectando datos de ventas del dia anterior", result: "45 ventas totales = $12,450" },
        { time: "08:01", action: "Analizando inventario bajo", result: "3 productos con stock critico" },
        { time: "08:02", action: "IA generando resumen ejecutivo", result: "Reporte PDF creado" },
        { time: "08:02", action: "Enviando reporte por email y WhatsApp", result: "Entregado al gerente" },
      ],
    },
    {
      name: "Calificador de Leads",
      status: "active",
      icon: "🎯",
      description: "Cuando llega un lead del formulario web, la IA lo califica y asigna al vendedor correcto",
      stats: { processed: 89, saved: "8hrs", accuracy: "92%" },
      log: [
        { time: "11:45", action: "Nuevo lead: Juan Perez - quiere 50 sillas para oficina", result: "Score: 85/100 - Lead caliente" },
        { time: "11:45", action: "Asignado a vendedor: Carlos (especialista corporativo)", result: "Notificacion enviada por WhatsApp" },
        { time: "11:20", action: "Nuevo lead: Ana Lopez - pregunta por precios", result: "Score: 40/100 - Lead tibio" },
        { time: "11:20", action: "Enviado email automatico con catalogo y precios", result: "Follow-up programado en 48hrs" },
      ],
    },
    {
      name: "Publicacion en Redes Sociales",
      status: "paused",
      icon: "📱",
      description: "Genera contenido con IA y publica automaticamente en Instagram, Facebook y TikTok",
      stats: { processed: 120, saved: "15hrs/sem", accuracy: "94%" },
      log: [
        { time: "09:00", action: "IA genero 3 opciones de post para hoy", result: "Tema: Tip de productividad" },
        { time: "09:01", action: "Seleccionado post #2 (mejor engagement predicho)", result: "Programado para 12pm" },
        { time: "12:00", action: "Publicado en Instagram y Facebook", result: "45 likes en primera hora" },
        { time: "14:00", action: "Respondiendo comentarios automaticamente", result: "8 comentarios respondidos" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xl">⚡</div>
            <div>
              <h1 className="font-bold text-gray-900">AutomatizaIA</h1>
              <p className="text-xs text-gray-500">Panel de Automatizacion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">4 automatizaciones activas</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Tareas Automatizadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">473</p>
            <p className="text-xs text-green-600 mt-1">+23 hoy</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Horas Ahorradas</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">39hrs</p>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Precision IA</p>
            <p className="text-3xl font-bold text-green-600 mt-1">95.5%</p>
            <p className="text-xs text-gray-500 mt-1">Promedio general</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Dinero Ahorrado</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">$4,200</p>
            <p className="text-xs text-gray-500 mt-1">vs contratar empleado</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Automatizaciones</h2>

        {/* Automations List */}
        <div className="space-y-4">
          {automations.map((auto, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setActiveAutomation(activeAutomation === i ? null : i)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{auto.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{auto.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        auto.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {auto.status === "active" ? "Activa" : "Pausada"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{auto.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{auto.stats.processed}</p>
                      <p className="text-xs text-gray-400">Procesados</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{auto.stats.saved}</p>
                      <p className="text-xs text-gray-400">Ahorrado</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{auto.stats.accuracy}</p>
                      <p className="text-xs text-gray-400">Precision</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeAutomation === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {activeAutomation === i && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Registro de Actividad</h4>
                  <div className="space-y-3">
                    {auto.log.map((entry, j) => (
                      <div key={j} className="flex gap-3 text-sm">
                        <span className="text-gray-400 font-mono shrink-0">{entry.time}</span>
                        <div>
                          <p className="text-gray-700">{entry.action}</p>
                          <p className="text-green-600 text-xs mt-0.5">→ {entry.result}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
