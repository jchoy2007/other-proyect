import Link from "next/link";
import { SOFTWARE_PRODUCTS, DESK_PRODUCTS, BUSINESS } from "@/lib/synovatech-data";

export default function SynovaTechHome() {
  const featuredSoftware = SOFTWARE_PRODUCTS.filter((p) =>
    ["win11-pro-retail", "office-2024", "office-2021"].includes(p.id)
  );
  const featuredDesks = DESK_PRODUCTS.filter((p) =>
    ["mesa-s60-led", "mesa-s2-l", "mesa-h2-led"].includes(p.id)
  );

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="bg-[#0a1628]/95 backdrop-blur-md border-b border-cyan-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/synovatech" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">ST</div>
            <span className="text-xl font-bold">Synova<span className="text-cyan-400">Tech</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/synovatech/software" className="text-gray-300 hover:text-cyan-400 transition-colors">Software</Link>
            <Link href="/synovatech/mesas" className="text-gray-300 hover:text-cyan-400 transition-colors">Mesas Gamer</Link>
            <a href={`https://wa.me/${BUSINESS.whatsapp}?text=Hola! Me interesa un producto de SynovaTech`} target="_blank" className="bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 rounded-full font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all">
              WhatsApp
            </a>
          </nav>
          <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" className="md:hidden bg-cyan-500 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-sm text-cyan-400 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Entrega Inmediata - Software 100% Original
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6">
              Licencias <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Originales</span> al Mejor Precio de Panama
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              Windows, Office, Servidores y Mesas Gamer. Software con entrega inmediata y mesas con envio gratis a todo el pais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/synovatech/software" className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:from-cyan-400 hover:to-blue-500 transition-all text-center">
                Ver Software
              </Link>
              <Link href="/synovatech/mesas" className="border-2 border-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-cyan-500 transition-colors text-center">
                Ver Mesas Gamer
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: "⚡", label: "Entrega Inmediata", sub: "Software al instante" },
              { icon: "✅", label: "100% Original", sub: "Licencias genuinas" },
              { icon: "🚚", label: "Envio Gratis", sub: "Mesas a todo Panama" },
              { icon: "🛡️", label: "Soporte Incluido", sub: "Instalacion remota" },
            ].map((badge, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-sm font-semibold mt-2">{badge.label}</p>
                <p className="text-xs text-gray-500">{badge.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#0d1d33]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestras Categorias</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/synovatech/software" className="group relative bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-cyan-800/30 rounded-2xl p-8 hover:border-cyan-500/50 transition-all overflow-hidden">
              <div className="relative z-10">
                <span className="text-5xl">💻</span>
                <h3 className="text-2xl font-bold mt-4 mb-2 group-hover:text-cyan-400 transition-colors">Software</h3>
                <p className="text-gray-400 mb-4">Windows 10/11, Office 2016-2024, Windows Server. Licencias originales con entrega inmediata.</p>
                <p className="text-cyan-400 font-semibold">Desde $8.00 → Ver productos</p>
              </div>
            </Link>
            <Link href="/synovatech/mesas" className="group relative bg-gradient-to-br from-purple-900/50 to-pink-900/30 border border-purple-800/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all overflow-hidden">
              <div className="relative z-10">
                <span className="text-5xl">🖥️</span>
                <h3 className="text-2xl font-bold mt-4 mb-2 group-hover:text-purple-400 transition-colors">Mesas Gamer</h3>
                <p className="text-gray-400 mb-4">Mesas gamer, electricas ajustables y con LED. Envio GRATIS a todo Panama por Red Servi.</p>
                <p className="text-purple-400 font-semibold">Desde $95.00 → Ver mesas</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Software */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Software Destacado</h2>
            <Link href="/synovatech/software" className="text-cyan-400 text-sm hover:underline">Ver todos →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {featuredSoftware.map((p) => (
              <Link href={`/synovatech/checkout?id=${p.id}`} key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-cyan-500/50 transition-all group">
                <div className="text-3xl mb-3">💿</div>
                <p className="text-xs text-cyan-400 font-medium">{p.subcategory} {p.type && `• ${p.type}`}</p>
                <h3 className="font-bold mt-1 group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-black text-cyan-400">${p.price.toFixed(2)}</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">⚡ Inmediata</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Desks */}
      <section className="py-16 bg-[#0d1d33]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Mesas Destacadas</h2>
            <Link href="/synovatech/mesas" className="text-purple-400 text-sm hover:underline">Ver todas →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {featuredDesks.map((p) => (
              <Link href={`/synovatech/checkout?id=${p.id}`} key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-all group">
                <div className="text-3xl mb-3">🖥️</div>
                <p className="text-xs text-purple-400 font-medium">{p.subcategory}</p>
                <h3 className="font-bold mt-1 group-hover:text-purple-400 transition-colors">{p.name}</h3>
                <p className="text-sm text-gray-400 mt-2">{p.dimensions}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-black text-purple-400">${p.price.toFixed(2)}</span>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">🚚 Envio gratis</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Metodos de Pago</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <span className="text-4xl">📱</span>
              <h3 className="font-bold mt-3 text-lg">Yappy</h3>
              <p className="text-gray-400 text-sm mt-2">Pago instantaneo desde tu celular</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-cyan-400">{BUSINESS.payment.yappy[0].number} ({BUSINESS.payment.yappy[0].name})</p>
                <p className="text-cyan-400">{BUSINESS.payment.yappy[1].number} ({BUSINESS.payment.yappy[1].name})</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <span className="text-4xl">🏦</span>
              <h3 className="font-bold mt-3 text-lg">ACH / Transferencia</h3>
              <p className="text-gray-400 text-sm mt-2">Transferencia bancaria directa</p>
              <div className="mt-3 text-sm text-cyan-400">
                <p>{BUSINESS.payment.ach.bank}</p>
                <p>{BUSINESS.payment.ach.type}</p>
                <p>{BUSINESS.payment.ach.holder}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-cyan-600 to-blue-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Necesitas ayuda? Escribenos!</h2>
          <p className="text-cyan-100 mb-8">Respondemos en minutos. Asesoramiento gratuito sobre que licencia o mesa necesitas.</p>
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}?text=Hola! Me interesa un producto de SynovaTech`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#060e1a] py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">ST</div>
                <span className="font-bold">Synova<span className="text-cyan-400">Tech</span></span>
              </div>
              <p className="text-sm text-gray-500">{BUSINESS.tagline}</p>
              <a href={BUSINESS.instagramUrl} target="_blank" className="text-sm text-cyan-400 hover:underline mt-2 block">{BUSINESS.instagram}</a>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Productos</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li><Link href="/synovatech/software" className="hover:text-white">Software</Link></li>
                <li><Link href="/synovatech/mesas" className="hover:text-white">Mesas Gamer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contacto</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>WhatsApp: {BUSINESS.whatsappDisplay}</li>
                <li>{BUSINESS.email}</li>
                <li>Panama</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-6 text-center text-xs text-gray-600">
            <p>© {new Date().getFullYear()} {BUSINESS.fullName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${BUSINESS.whatsapp}?text=Hola! Me interesa un producto`}
        target="_blank"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors animate-pulse-green"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.607-.798-6.384-2.147l-.144-.108-3.094 1.038 1.038-3.094-.108-.144A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
      </a>
    </div>
  );
}
