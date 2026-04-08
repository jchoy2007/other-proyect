export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "297",
      priceMonth: "99",
      description: "Ideal para negocios pequenos que quieren empezar",
      features: [
        "Bot con IA para WhatsApp",
        "Hasta 500 conversaciones/mes",
        "Menu/Catalogo interactivo",
        "Respuestas automaticas 24/7",
        "Panel basico de estadisticas",
        "Soporte por email",
      ],
      notIncluded: [
        "Agenda de citas",
        "Mensajes masivos",
        "Integraciones avanzadas",
      ],
      popular: false,
      cta: "Empezar Ahora",
    },
    {
      name: "Profesional",
      price: "497",
      priceMonth: "199",
      description: "Para negocios que quieren automatizar todo",
      features: [
        "Todo del plan Starter",
        "Hasta 2,000 conversaciones/mes",
        "Agenda de citas automatica",
        "Toma de pedidos completa",
        "Mensajes masivos y promociones",
        "Panel avanzado con analytics",
        "Transferencia a humano",
        "Soporte prioritario por WhatsApp",
      ],
      notIncluded: [],
      popular: true,
      cta: "Elegir Profesional",
    },
    {
      name: "Enterprise",
      price: "997",
      priceMonth: "399",
      description: "Para negocios con alto volumen",
      features: [
        "Todo del plan Profesional",
        "Conversaciones ilimitadas",
        "Multiples numeros de WhatsApp",
        "Integracion con tu sistema (CRM, POS)",
        "Bot personalizado a tu marca",
        "API de acceso",
        "Gerente de cuenta dedicado",
        "Soporte 24/7",
      ],
      notIncluded: [],
      popular: false,
      cta: "Contactar Ventas",
    },
  ];

  return (
    <section id="precios" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu negocio. Todos incluyen setup
            e instalacion.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                clipRule="evenodd"
              />
            </svg>
            Precio de setup unico + mensualidad. Sin contratos a largo plazo.
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-white border-2 border-green-wa shadow-xl scale-105"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-wa text-white px-4 py-1 rounded-full text-sm font-bold">
                  Mas Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 text-sm">USD setup</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-green-wa">
                    + ${plan.priceMonth}
                  </span>
                  <span className="text-gray-500 text-sm">USD/mes</span>
                </div>
              </div>

              <a
                href="#contacto"
                className={`mt-6 block text-center py-3 px-6 rounded-full font-semibold transition-colors ${
                  plan.popular
                    ? "bg-green-wa text-white hover:bg-green-wa-dark"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </a>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-green-wa shrink-0"
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
                {plan.notIncluded.map((feature, j) => (
                  <li
                    key={`no-${j}`}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
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
