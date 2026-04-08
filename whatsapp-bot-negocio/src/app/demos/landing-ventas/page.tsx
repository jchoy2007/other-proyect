export default function LandingGimnasio() {
  const plans = [
    {
      name: "Basico",
      price: "499",
      period: "/mes",
      features: ["Acceso a area de pesas", "Vestidores y regaderas", "Horario de 6am a 10pm", "App de seguimiento"],
      popular: false,
    },
    {
      name: "Premium",
      price: "799",
      period: "/mes",
      features: ["Todo del plan Basico", "Clases grupales ilimitadas", "Zona de cardio premium", "1 sesion con trainer/mes", "Acceso a sauna", "Horario 24/7"],
      popular: true,
    },
    {
      name: "VIP",
      price: "1,299",
      period: "/mes",
      features: ["Todo del plan Premium", "Entrenador personal 3x/semana", "Plan de nutricion", "Suplementos incluidos", "Locker personal", "Invitado gratis"],
      popular: false,
    },
  ];

  const transformations = [
    { name: "Diego R.", before: "95kg", after: "78kg", time: "4 meses", text: "Baje 17kg en 4 meses. Los entrenadores saben lo que hacen." },
    { name: "Karla M.", before: "Sedentaria", after: "Media maraton", time: "6 meses", text: "De no poder correr 1km a completar una media maraton. FitPro cambio mi vida." },
    { name: "Andres T.", before: "68kg", after: "82kg musculo", time: "8 meses", text: "Gane 14kg de musculo limpio. El plan de nutricion es clave." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="text-xl font-black">FIT<span className="text-orange-500">PRO</span></span>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#planes" className="hover:text-orange-500">Planes</a>
            <a href="#resultados" className="hover:text-orange-500">Resultados</a>
            <a href="#registro" className="bg-orange-500 px-5 py-2 rounded-full font-bold hover:bg-orange-600">Inscribete Hoy</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-black text-white py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-1.5 rounded-full text-sm text-orange-400 mb-6">
              OFERTA DE LANZAMIENTO - 50% OFF PRIMER MES
            </div>
            <h1 className="text-5xl sm:text-7xl font-black leading-none mb-6">
              TRANSFORMA<br />
              TU <span className="text-orange-500">CUERPO</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              El gimnasio mas equipado de la ciudad. Entrenadores certificados, clases grupales y resultados garantizados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#registro" className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-black hover:bg-orange-600 transition-colors text-center">
                EMPIEZA HOY - 50% OFF
              </a>
              <a href="#planes" className="border-2 border-white/30 text-white px-8 py-4 rounded-full text-lg font-bold hover:border-orange-500 transition-colors text-center">
                Ver Planes
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-4xl font-black text-orange-500">2,500+</p>
              <p className="text-gray-400 text-sm mt-1">Miembros activos</p>
            </div>
            <div>
              <p className="text-4xl font-black text-orange-500">50+</p>
              <p className="text-gray-400 text-sm mt-1">Clases por semana</p>
            </div>
            <div>
              <p className="text-4xl font-black text-orange-500">15</p>
              <p className="text-gray-400 text-sm mt-1">Entrenadores</p>
            </div>
            <div>
              <p className="text-4xl font-black text-orange-500">24/7</p>
              <p className="text-gray-400 text-sm mt-1">Horario premium</p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">NUESTRAS CLASES</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "CrossFit", icon: "🏋️", desc: "Alta intensidad, resultados rapidos" },
              { name: "Yoga", icon: "🧘", desc: "Flexibilidad y paz mental" },
              { name: "Spinning", icon: "🚴", desc: "Cardio extremo, quema grasa" },
              { name: "Box", icon: "🥊", desc: "Fuerza y defensa personal" },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <span className="text-5xl">{c.icon}</span>
                <h3 className="text-lg font-black mt-4 mb-2">{c.name}</h3>
                <p className="text-sm text-gray-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">ELIGE TU PLAN</h2>
          <p className="text-center text-gray-500 mb-12">Todos los planes incluyen acceso a las instalaciones</p>
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 ${plan.popular ? "bg-black text-white shadow-2xl scale-105 relative" : "bg-white border border-gray-200"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Mas Popular
                  </div>
                )}
                <h3 className="text-xl font-black">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-gray-400" : "text-gray-500"}`}>MXN{plan.period}</span>
                </div>
                <a href="#registro" className={`mt-6 block text-center py-3 rounded-full font-bold transition-colors ${
                  plan.popular ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}>
                  Inscribirme
                </a>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="text-orange-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformations */}
      <section id="resultados" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">RESULTADOS REALES</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {transformations.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-black text-orange-500">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.time} de transformacion</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-lg p-3">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400">Antes</p>
                    <p className="font-bold text-red-500">{t.before}</p>
                  </div>
                  <span className="text-2xl">→</span>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400">Despues</p>
                    <p className="font-bold text-green-500">{t.after}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="registro" className="py-16 sm:py-24 bg-black text-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">EMPIEZA HOY</h2>
          <p className="text-gray-400 mb-2">50% de descuento en tu primer mes</p>
          <p className="text-5xl font-black text-orange-500 mb-8">$249 <span className="text-lg text-gray-500 line-through">$499</span></p>
          <div className="bg-gray-900 rounded-2xl p-6 space-y-4 text-left">
            <input type="text" placeholder="Nombre completo" className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 outline-none focus:border-orange-500" />
            <input type="tel" placeholder="WhatsApp" className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 outline-none focus:border-orange-500" />
            <select className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 outline-none focus:border-orange-500">
              <option>Selecciona tu plan</option>
              <option>Basico - $499/mes</option>
              <option>Premium - $799/mes</option>
              <option>VIP - $1,299/mes</option>
            </select>
            <button className="w-full bg-orange-500 text-white py-4 rounded-lg font-black text-lg hover:bg-orange-600 transition-colors">
              QUIERO MI 50% OFF
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-black text-gray-500 py-6 text-center text-sm border-t border-gray-800">
        <p>© 2026 FitPro Gym. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
