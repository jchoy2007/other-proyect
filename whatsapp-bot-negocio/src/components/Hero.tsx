export function Hero() {
  return (
    <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-br from-white via-green-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-wa rounded-full animate-pulse" />
              Potenciado con Inteligencia Artificial
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tu negocio vendiendo{" "}
              <span className="text-green-wa">24/7</span> por WhatsApp
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg">
              Un bot inteligente que atiende a tus clientes, toma pedidos, agenda
              citas y cierra ventas por ti.{" "}
              <strong>Mientras tu duermes, tu bot vende.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#precios"
                className="animate-pulse-green bg-green-wa text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-green-wa-dark transition-colors text-center"
              >
                Quiero mi Bot Ahora
              </a>
              <a
                href="#como-funciona"
                className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-green-wa hover:text-green-wa transition-colors text-center"
              >
                Ver Demo
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-wa"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Setup en 48hrs
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-wa"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Sin contratos
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-wa"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Soporte incluido
              </div>
            </div>
          </div>

          {/* Phone mockup with chat */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="animate-float relative w-[300px] sm:w-[340px]">
              {/* Phone frame */}
              <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
                <div className="bg-[#ECE5DD] rounded-[2rem] overflow-hidden">
                  {/* WhatsApp header */}
                  <div className="bg-green-wa-dark px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Tu Negocio
                      </p>
                      <p className="text-green-200 text-xs">En linea</p>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="p-3 space-y-2 min-h-[350px]">
                    <div className="flex justify-end">
                      <div className="bg-green-wa-light rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">
                          Hola! Quiero hacer un pedido
                        </p>
                        <p className="text-[10px] text-gray-500 text-right">
                          10:30
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm">
                        <p className="text-sm text-gray-800">
                          Hola! Bienvenido a Tu Negocio. Con gusto te ayudo con
                          tu pedido. Aqui esta nuestro menu del dia:
                        </p>
                        <p className="text-[10px] text-gray-500 text-right">
                          10:30
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm">
                        <p className="text-sm text-gray-800">
                          1. Hamburguesa clasica - $89
                          <br />
                          2. Pizza margarita - $129
                          <br />
                          3. Ensalada cesar - $79
                          <br />
                          <br />
                          Que te gustaria ordenar?
                        </p>
                        <p className="text-[10px] text-gray-500 text-right">
                          10:30
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-green-wa-light rounded-lg px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-gray-800">
                          Quiero 2 hamburguesas!
                        </p>
                        <p className="text-[10px] text-gray-500 text-right">
                          10:31
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm">
                        <p className="text-sm text-gray-800">
                          Perfecto! 2 hamburguesas clasicas = $178. Cual es tu
                          direccion para el envio?
                        </p>
                        <p className="text-[10px] text-gray-500 text-right">
                          10:31
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-lg px-4 py-2 border border-green-100">
                <p className="text-xs text-gray-500">Respuesta en</p>
                <p className="text-lg font-bold text-green-wa">&lt; 3 seg</p>
              </div>

              <div className="absolute -left-4 bottom-24 bg-white rounded-xl shadow-lg px-4 py-2 border border-green-100">
                <p className="text-xs text-gray-500">Disponible</p>
                <p className="text-lg font-bold text-green-wa">24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
