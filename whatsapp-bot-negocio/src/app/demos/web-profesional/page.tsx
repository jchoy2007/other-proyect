export default function WebProfesional() {
  const services = [
    { name: "Limpieza Dental", desc: "Limpieza profunda con ultrasonido", price: "$800 MXN", icon: "🦷" },
    { name: "Blanqueamiento", desc: "Blanqueamiento LED profesional", price: "$3,500 MXN", icon: "✨" },
    { name: "Ortodoncia", desc: "Brackets metalicos y esteticos", price: "Desde $15,000 MXN", icon: "😁" },
    { name: "Implantes", desc: "Implantes de titanio premium", price: "Desde $12,000 MXN", icon: "🔩" },
    { name: "Endodoncia", desc: "Tratamiento de conductos", price: "$4,500 MXN", icon: "💉" },
    { name: "Carillas", desc: "Carillas de porcelana", price: "Desde $5,000 MXN", icon: "💎" },
  ];

  const team = [
    { name: "Dra. Maria Lopez", role: "Directora General", specialty: "Ortodoncia y Estetica Dental", years: "15 años de experiencia" },
    { name: "Dr. Carlos Ramirez", role: "Especialista", specialty: "Implantologia y Cirugia Oral", years: "12 años de experiencia" },
    { name: "Dra. Ana Torres", role: "Especialista", specialty: "Endodoncia y Odontopediatria", years: "8 años de experiencia" },
  ];

  const testimonials = [
    { name: "Roberto M.", text: "Excelente atencion. La Dra. Lopez me hizo un blanqueamiento increible. Mi sonrisa nunca se habia visto mejor.", rating: 5 },
    { name: "Patricia G.", text: "Mis hijos ya no le tienen miedo al dentista gracias a la Dra. Torres. El ambiente es muy acogedor y profesional.", rating: 5 },
    { name: "Fernando S.", text: "Me pusieron un implante y el resultado es perfecto. No se nota la diferencia. Muy recomendados.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            <span className="text-xl font-bold text-gray-900">Clinica <span className="text-blue-600">Sonrisa</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#servicios" className="hover:text-blue-600">Servicios</a>
            <a href="#equipo" className="hover:text-blue-600">Equipo</a>
            <a href="#testimonios" className="hover:text-blue-600">Testimonios</a>
            <a href="#contacto" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700">Agendar Cita</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              +5,000 pacientes satisfechos
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Tu sonrisa perfecta esta a una <span className="text-blue-600">cita de distancia</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Clinica dental con tecnologia de punta y un equipo de especialistas dedicados a tu salud bucal. Primera consulta de valoracion sin costo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contacto" className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-colors text-center">
                Agendar Cita Gratis
              </a>
              <a href="tel:+525512345678" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-blue-600 transition-colors text-center">
                Llamar Ahora
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="bg-blue-100 rounded-3xl p-8 text-center">
              <div className="text-8xl mb-4">😁</div>
              <p className="text-blue-800 font-semibold text-lg">Tu nueva sonrisa te espera</p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-3">
                  <p className="text-2xl font-bold text-blue-600">15+</p>
                  <p className="text-xs text-gray-500">Años exp.</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-2xl font-bold text-blue-600">5K+</p>
                  <p className="text-xs text-gray-500">Pacientes</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-2xl font-bold text-blue-600">98%</p>
                  <p className="text-xs text-gray-500">Satisfaccion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-lg text-gray-600">Tratamientos dentales con la mejor tecnologia y materiales</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <span className="text-4xl">{service.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{service.desc}</p>
                <p className="text-blue-600 font-bold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="equipo" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
            <p className="text-lg text-gray-600">Profesionales certificados comprometidos con tu salud</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                  {i === 0 ? "👩‍⚕️" : i === 1 ? "👨‍⚕️" : "👩‍⚕️"}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-medium text-sm">{member.role}</p>
                <p className="text-gray-600 text-sm mt-2">{member.specialty}</p>
                <p className="text-gray-400 text-xs mt-1">{member.years}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros pacientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-gray-900">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-16 sm:py-24 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Agenda tu cita hoy</h2>
          <p className="text-blue-100 text-lg mb-8">Primera consulta de valoracion sin costo. Llena el formulario y te contactamos en menos de 1 hora.</p>
          <div className="bg-white rounded-2xl p-8 text-left">
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre completo" className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none" />
              <input type="tel" placeholder="Telefono / WhatsApp" className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none" />
              <select className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-gray-500">
                <option>Selecciona servicio</option>
                <option>Limpieza dental</option>
                <option>Blanqueamiento</option>
                <option>Ortodoncia</option>
                <option>Implantes</option>
                <option>Endodoncia</option>
                <option>Otro</option>
              </select>
              <select className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-gray-500">
                <option>Horario preferido</option>
                <option>Manana (9am - 12pm)</option>
                <option>Tarde (12pm - 5pm)</option>
                <option>Noche (5pm - 8pm)</option>
              </select>
            </div>
            <button className="mt-6 w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors">
              Agendar Mi Cita Gratis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 Clinica Dental Sonrisa. Todos los derechos reservados.</p>
          <p className="text-xs mt-2">Av. Reforma #123, Col. Centro, CDMX | Tel: (55) 1234-5678</p>
        </div>
      </footer>
    </div>
  );
}
