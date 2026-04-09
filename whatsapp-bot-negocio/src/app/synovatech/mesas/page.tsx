import Link from "next/link";
import { DESK_PRODUCTS, BUSINESS } from "@/lib/synovatech-data";

export default function MesasPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="bg-[#0a1628]/95 backdrop-blur-md border-b border-cyan-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/synovatech" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">ST</div>
            <span className="text-xl font-bold">Synova<span className="text-cyan-400">Tech</span></span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/synovatech/software" className="text-gray-300 hover:text-cyan-400 hidden sm:block">Software</Link>
            <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" className="bg-green-500 px-4 py-2 rounded-full font-semibold text-sm">WhatsApp</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/synovatech" className="text-cyan-400 text-sm hover:underline">← Volver a inicio</Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Mesas Gamer y Electricas</h1>
          <p className="text-gray-400 mt-2">Envio GRATIS a todo Panama por Red Servi. Stock disponible inmediato.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/30 border border-purple-500/20 rounded-xl p-6 mb-8 flex items-center gap-4">
          <span className="text-4xl">🚚</span>
          <div>
            <p className="font-bold text-lg">Envio GRATIS a todo Panama</p>
            <p className="text-gray-400 text-sm">Todas las mesas incluyen envio sin costo por Red Servi. Tiempo estimado: 3-5 dias habiles.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESK_PRODUCTS.map((p) => (
            <Link
              href={`/synovatech/checkout?id=${p.id}`}
              key={p.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group"
            >
              {/* Image placeholder */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 h-48 flex items-center justify-center">
                <span className="text-6xl opacity-50">🖥️</span>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{p.subcategory}</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Disponible</span>
                </div>

                <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors">{p.name}</h3>
                <p className="text-sm text-gray-400 mt-2">{p.description}</p>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>📐 {p.dimensions}</span>
                </div>

                <ul className="mt-3 space-y-1">
                  {p.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="text-purple-500">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-2xl font-black text-purple-400">${p.price.toFixed(2)}</span>
                  <span className="text-sm text-purple-400 font-semibold group-hover:underline">Comprar →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
