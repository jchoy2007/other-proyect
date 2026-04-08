import Link from "next/link";

export default function DemosIndex() {
  const demos = [
    {
      id: 1,
      title: "Pagina Web Profesional",
      subtitle: "Clinica Dental Sonrisa",
      description: "Sitio web completo para un consultorio dental con secciones de servicios, equipo, testimonios y agenda de citas.",
      href: "/demos/web-profesional",
      price: "$100 - $500",
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Bot de WhatsApp con IA",
      subtitle: "Demo interactivo",
      description: "Simulacion de un bot de WhatsApp inteligente que atiende clientes, toma pedidos y responde preguntas.",
      href: "/demos/bot-whatsapp",
      price: "$200 - $800",
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Automatizacion con IA",
      subtitle: "Dashboard de automatizacion",
      description: "Panel que muestra como se automatizan emails, reportes, respuestas a clientes y procesamiento de datos.",
      href: "/demos/automatizacion",
      price: "$150 - $1,000",
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Landing Page de Ventas",
      subtitle: "Gimnasio FitPro",
      description: "Landing page de alta conversion para un gimnasio, con planes, testimonios y formulario de registro.",
      href: "/demos/landing-ventas",
      price: "$80 - $300",
      color: "bg-orange-500",
    },
    {
      id: 5,
      title: "Script / Bot Personalizado",
      subtitle: "Analizador de Resenas",
      description: "Herramienta que analiza resenas de clientes con IA y genera reportes automaticos de sentimiento.",
      href: "/demos/script-bot",
      price: "$50 - $500",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portafolio de Servicios
          </h1>
          <p className="text-lg text-gray-600">
            5 demos de los servicios que ofrecemos. Click en cada uno para verlo en accion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              href={demo.href}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className={`${demo.color} h-2`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`${demo.color} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center`}>
                    {demo.id}
                  </span>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Demo
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {demo.title}
                </h2>
                <p className="text-sm text-gray-500 mb-3">{demo.subtitle}</p>
                <p className="text-sm text-gray-600 mb-4">{demo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600">
                    Precio: {demo.price}
                  </span>
                  <span className="text-sm text-blue-500 font-medium group-hover:underline">
                    Ver demo →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
