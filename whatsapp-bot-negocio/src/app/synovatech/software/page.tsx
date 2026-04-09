import Link from "next/link";
import { SOFTWARE_PRODUCTS, BUSINESS } from "@/lib/synovatech-data";

export default function SoftwarePage() {
  const categories = ["Windows 11", "Windows 10", "Microsoft Office", "Windows Server"];

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="bg-[#0a1628]/95 backdrop-blur-md border-b border-cyan-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/synovatech" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">ST</div>
            <span className="text-xl font-bold">Synova<span className="text-cyan-400">Tech</span></span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/synovatech/mesas" className="text-gray-300 hover:text-cyan-400 hidden sm:block">Mesas</Link>
            <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" className="bg-green-500 px-4 py-2 rounded-full font-semibold text-sm">WhatsApp</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/synovatech" className="text-cyan-400 text-sm hover:underline">← Volver a inicio</Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Software Original</h1>
          <p className="text-gray-400 mt-2">Licencias 100% originales Microsoft. Entrega inmediata por email y WhatsApp.</p>
        </div>

        {categories.map((cat) => {
          const products = SOFTWARE_PRODUCTS.filter((p) => p.subcategory === cat);
          return (
            <div key={cat} className="mb-12">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-cyan-400">{cat === "Windows 11" ? "🪟" : cat === "Windows 10" ? "🖥️" : cat === "Microsoft Office" ? "📦" : "🖧"}</span>
                {cat}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <Link
                    href={`/synovatech/checkout?id=${p.id}`}
                    key={p.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{p.type || "Licencia"}</span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">⚡ Inmediata</span>
                    </div>
                    <h3 className="font-bold group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{p.description}</p>
                    <ul className="mt-3 space-y-1">
                      {p.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="text-cyan-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className="text-2xl font-black text-cyan-400">${p.price.toFixed(2)}</span>
                      <span className="text-sm text-cyan-400 font-semibold group-hover:underline">Comprar →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
