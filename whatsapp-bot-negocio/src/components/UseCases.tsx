export function UseCases() {
  const cases = [
    {
      industry: "Restaurantes",
      emoji: "🍔",
      features: [
        "Muestra el menu interactivo",
        "Toma pedidos completos",
        "Calcula totales con extras",
        "Confirma tiempo de entrega",
        "Maneja reservaciones",
      ],
      color: "bg-orange-50 border-orange-200",
    },
    {
      industry: "Clinicas y Consultorios",
      emoji: "🏥",
      features: [
        "Agenda citas automaticamente",
        "Recordatorios de citas",
        "Responde preguntas frecuentes",
        "Confirma disponibilidad",
        "Envia resultados",
      ],
      color: "bg-blue-50 border-blue-200",
    },
    {
      industry: "Inmobiliarias",
      emoji: "🏠",
      features: [
        "Califica leads (presupuesto, zona)",
        "Muestra propiedades disponibles",
        "Agenda visitas",
        "Follow-up automatico",
        "Envia fichas tecnicas",
      ],
      color: "bg-purple-50 border-purple-200",
    },
    {
      industry: "Tiendas / E-commerce",
      emoji: "🛍️",
      features: [
        "Catalogo de productos",
        "Estado de pedidos",
        "Soporte post-venta",
        "Recomendaciones personalizadas",
        "Recupera carritos abandonados",
      ],
      color: "bg-pink-50 border-pink-200",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Funciona para cualquier negocio
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Adaptamos el bot a las necesidades especificas de tu industria
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((useCase, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 border ${useCase.color} hover:shadow-lg transition-shadow`}
            >
              <div className="text-4xl mb-4">{useCase.emoji}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {useCase.industry}
              </h3>
              <ul className="space-y-2">
                {useCase.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-green-wa mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
