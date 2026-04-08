export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Nos cuentas de tu negocio",
      description:
        "Nos dices que vendes, tus precios, horarios, preguntas frecuentes y como quieres que el bot atienda a tus clientes.",
      icon: (
        <svg
          className="w-10 h-10 text-green-wa"
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
      ),
    },
    {
      number: "02",
      title: "Configuramos tu bot en 48hrs",
      description:
        "Nuestro equipo configura tu bot con inteligencia artificial, lo entrena con tu informacion y lo conecta a tu WhatsApp Business.",
      icon: (
        <svg
          className="w-10 h-10 text-green-wa"
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
      ),
    },
    {
      number: "03",
      title: "Tu bot empieza a vender",
      description:
        "Tu bot responde automaticamente a cada mensaje. Atiende clientes, toma pedidos, agenda citas y cierra ventas 24/7.",
      icon: (
        <svg
          className="w-10 h-10 text-green-wa"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Como funciona?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En 3 simples pasos tu negocio tendra un asistente virtual vendiendo
            24/7
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-2xl mb-6">
                {step.icon}
              </div>
              <div className="text-5xl font-black text-green-100 absolute top-0 right-4 select-none">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 right-0 translate-x-1/2 w-8">
                  <svg
                    className="w-8 h-8 text-green-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
