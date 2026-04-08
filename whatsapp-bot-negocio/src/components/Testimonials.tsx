export function Testimonials() {
  const testimonials = [
    {
      name: "Maria Rodriguez",
      business: "Restaurante El Sabor",
      text: "Desde que instalamos el bot, nuestros pedidos por WhatsApp aumentaron un 40%. Los clientes aman poder pedir a cualquier hora y el bot nunca se equivoca con los pedidos.",
      rating: 5,
    },
    {
      name: "Dr. Carlos Martinez",
      business: "Clinica Dental Sonrisa",
      text: "Ya no perdemos citas. El bot agenda automaticamente y envia recordatorios. Mis recepcionistas ahora se enfocan en atencion presencial en lugar de contestar WhatsApp todo el dia.",
      rating: 5,
    },
    {
      name: "Laura Gomez",
      business: "Inmobiliaria Premium",
      text: "El bot califica leads mientras dormimos. Antes respondiamos al dia siguiente y el cliente ya habia comprado con otro. Ahora respondemos en segundos, 24/7.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-gray-600">
            Negocios reales con resultados reales
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <svg
                    key={j}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">{testimonial.business}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 bg-green-wa rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          <div>
            <p className="text-3xl sm:text-4xl font-black">500+</p>
            <p className="text-green-100 text-sm mt-1">Negocios activos</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black">2M+</p>
            <p className="text-green-100 text-sm mt-1">Mensajes procesados</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black">98%</p>
            <p className="text-green-100 text-sm mt-1">Clientes satisfechos</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black">&lt;3s</p>
            <p className="text-green-100 text-sm mt-1">
              Tiempo de respuesta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
