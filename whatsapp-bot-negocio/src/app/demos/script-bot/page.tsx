"use client";

import { useState } from "react";

interface ReviewAnalysis {
  text: string;
  sentiment: "positivo" | "negativo" | "neutral";
  score: number;
  topics: string[];
  summary: string;
}

const sampleReviews: ReviewAnalysis[] = [
  {
    text: "Excelente comida, el servicio fue rapido y la atencion muy amable. Definitivamente regresare.",
    sentiment: "positivo",
    score: 95,
    topics: ["comida", "servicio", "atencion"],
    summary: "Cliente muy satisfecho con la experiencia general",
  },
  {
    text: "La comida estaba bien pero tardaron mucho en atendernos. Casi 40 minutos para que nos tomaran la orden.",
    sentiment: "neutral",
    score: 50,
    topics: ["comida", "tiempo de espera", "servicio"],
    summary: "Comida aceptable pero servicio lento - area de mejora identificada",
  },
  {
    text: "Pesimo servicio. El mesero fue grosero y la comida llego fria. No vuelvo nunca.",
    sentiment: "negativo",
    score: 10,
    topics: ["servicio", "personal", "temperatura comida"],
    summary: "Experiencia negativa critica - requiere atencion inmediata",
  },
  {
    text: "Buen ambiente, musica agradable. Los tacos al pastor son los mejores de la zona. Precios accesibles.",
    sentiment: "positivo",
    score: 88,
    topics: ["ambiente", "musica", "tacos", "precios"],
    summary: "Buena experiencia, destaca el producto estrella y precios",
  },
  {
    text: "Fui con mi familia el domingo. El lugar estaba lleno y no habia estacionamiento. La comida regular.",
    sentiment: "negativo",
    score: 30,
    topics: ["capacidad", "estacionamiento", "comida"],
    summary: "Problemas de capacidad en fines de semana, comida no destaco",
  },
  {
    text: "Me encanto el postre de chocolate. Muy creativo. El mesero nos recomendo bien.",
    sentiment: "positivo",
    score: 85,
    topics: ["postre", "recomendacion", "creatividad"],
    summary: "Destaca postre y buena asesoria del personal",
  },
];

export default function ScriptBotDemo() {
  const [analyzed, setAnalyzed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);

  function startAnalysis() {
    setProcessing(true);
    setCurrentReview(0);
    setAnalyzed(false);

    const interval = setInterval(() => {
      setCurrentReview((prev) => {
        if (prev >= sampleReviews.length - 1) {
          clearInterval(interval);
          setProcessing(false);
          setAnalyzed(true);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  }

  const positiveCount = sampleReviews.filter((r) => r.sentiment === "positivo").length;
  const negativeCount = sampleReviews.filter((r) => r.sentiment === "negativo").length;
  const neutralCount = sampleReviews.filter((r) => r.sentiment === "neutral").length;
  const avgScore = Math.round(sampleReviews.reduce((sum, r) => sum + r.score, 0) / sampleReviews.length);

  const allTopics: Record<string, number> = {};
  sampleReviews.forEach((r) =>
    r.topics.forEach((t) => {
      allTopics[t] = (allTopics[t] || 0) + 1;
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl">🔍</div>
            <div>
              <h1 className="font-bold text-gray-900">ReviewBot AI</h1>
              <p className="text-xs text-gray-500">Analizador de Resenas con Inteligencia Artificial</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Analizar Resenas</h2>
          <p className="text-sm text-gray-500 mb-4">
            Este bot analiza resenas de clientes con IA. Detecta sentimiento, extrae temas clave y genera un reporte ejecutivo automatico.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
            <p className="text-xs text-gray-400 mb-2">6 resenas cargadas para analisis:</p>
            {sampleReviews.map((r, i) => (
              <p key={i} className={`text-sm py-1 ${processing && i <= currentReview ? "text-gray-900" : "text-gray-400"}`}>
                {processing && i <= currentReview && <span className="text-green-500 mr-1">✓</span>}
                {processing && i === currentReview + 1 && <span className="text-yellow-500 mr-1 animate-spin inline-block">◌</span>}
                &ldquo;{r.text.substring(0, 60)}...&rdquo;
              </p>
            ))}
          </div>
          <button
            onClick={startAnalysis}
            disabled={processing}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
              processing ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {processing ? `Analizando... (${currentReview + 1}/${sampleReviews.length})` : analyzed ? "Analizar de Nuevo" : "Iniciar Analisis con IA"}
          </button>
        </div>

        {/* Results */}
        {analyzed && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Score General</p>
                <p className={`text-3xl font-bold mt-1 ${avgScore >= 60 ? "text-green-600" : "text-red-600"}`}>{avgScore}/100</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Positivas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{positiveCount}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Negativas</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{negativeCount}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Neutras</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{neutralCount}</p>
              </div>
            </div>

            {/* AI Report */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🤖</span> Reporte Generado por IA
              </h3>
              <div className="bg-blue-50 rounded-lg p-5 text-sm text-gray-700 space-y-3">
                <p><strong>Resumen Ejecutivo:</strong> De 6 resenas analizadas, el negocio tiene una percepcion general POSITIVA con un score de {avgScore}/100. Los principales puntos fuertes son la calidad de la comida y el ambiente. Las areas de mejora criticas son el tiempo de servicio y la capacidad en horarios pico.</p>
                <p><strong>Fortalezas:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Calidad de comida consistentemente mencionada positivamente (tacos al pastor como producto estrella)</li>
                  <li>Ambiente agradable y buena musica</li>
                  <li>Precios percibidos como accesibles</li>
                  <li>Postres creativos generan buena impresion</li>
                </ul>
                <p><strong>Areas de Mejora (URGENTE):</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li className="text-red-600">Capacitacion del personal - se detecto un incidente de trato grosero</li>
                  <li className="text-red-600">Tiempo de espera excesivo (40+ minutos reportados)</li>
                  <li className="text-yellow-600">Falta de estacionamiento en fines de semana</li>
                  <li className="text-yellow-600">Control de temperatura de alimentos</li>
                </ul>
                <p><strong>Recomendaciones:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Implementar sistema de turnos o reservaciones para fines de semana</li>
                  <li>Capacitacion mensual en servicio al cliente para meseros</li>
                  <li>Revisar tiempos de cocina - objetivo: maximo 20 min desde orden</li>
                  <li>Promover mas el postre de chocolate como diferenciador</li>
                </ol>
              </div>
            </div>

            {/* Topic Cloud */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Temas Mas Mencionados</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(allTopics)
                  .sort((a, b) => b[1] - a[1])
                  .map(([topic, count]) => (
                    <span
                      key={topic}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        count >= 3 ? "bg-red-100 text-red-700" : count >= 2 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {topic} ({count})
                    </span>
                  ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Detalle por Resena</h3>
              <div className="space-y-4">
                {sampleReviews.map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 italic mb-2">&ldquo;{r.text}&rdquo;</p>
                        <p className="text-xs text-gray-500">{r.summary}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          r.sentiment === "positivo" ? "bg-green-100 text-green-700" :
                          r.sentiment === "negativo" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {r.sentiment} {r.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
