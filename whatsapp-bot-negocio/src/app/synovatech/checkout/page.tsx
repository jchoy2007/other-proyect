"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { getProduct, BUSINESS } from "@/lib/synovatech-data";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const product = productId ? getProduct(productId) : null;
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    setOrderNumber(`ST-${Date.now().toString().slice(-6)}`);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">Producto no encontrado</p>
          <Link href="/synovatech" className="text-cyan-400 hover:underline">← Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  const isSoftware = product.category === "software";

  const whatsappMsg = encodeURIComponent(
    `Hola SynovaTech! Quiero comprar:\n\n📦 ${product.name}\n💰 Precio: $${product.price.toFixed(2)}\n🧾 Orden: ${orderNumber}\n\nVoy a pagar por Yappy/ACH. Me confirman por favor.`
  );

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="bg-[#0a1628]/95 backdrop-blur-md border-b border-cyan-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/synovatech" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">ST</div>
            <span className="text-xl font-bold">Synova<span className="text-cyan-400">Tech</span></span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/synovatech" className="text-cyan-400 text-sm hover:underline">← Volver a la tienda</Link>

        <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-8">Finalizar Compra</h1>

        {/* Product Summary */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-cyan-400 font-medium">{product.subcategory}</p>
              <h2 className="text-xl font-bold mt-1">{product.name}</h2>
              <p className="text-sm text-gray-400 mt-2">{product.description}</p>
            </div>
            <span className="text-3xl font-black text-cyan-400">${product.price.toFixed(2)}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              {isSoftware ? "⚡ Entrega: Inmediata por email y WhatsApp" : `🚚 Envio: GRATIS a todo Panamá (Red Servi, 3-5 dias)`}
            </p>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-2">
            {product.features.map((f, i) => (
              <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                <span className="text-cyan-500">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Order Details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Resumen de Orden</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Producto</span>
              <span>{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cantidad</span>
              <span>1</span>
            </div>
            {!isSoftware && (
              <div className="flex justify-between">
                <span className="text-gray-400">Envio</span>
                <span className="text-green-400">GRATIS</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-bold">
              <span>Total</span>
              <span className="text-cyan-400">${product.price.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Numero de orden</span>
              <span>{orderNumber}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Elige tu metodo de pago</h3>

          {/* Yappy */}
          <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📱</span>
              <h4 className="font-bold">Yappy</h4>
              <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">Recomendado</span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">Envia <span className="text-white font-bold">${product.price.toFixed(2)}</span> a cualquiera de estos numeros:</p>
              <div className="bg-black/30 rounded-lg p-3 space-y-2">
                <p className="font-mono text-cyan-400 text-lg">{BUSINESS.payment.yappy[0].number} <span className="text-gray-500 text-sm">({BUSINESS.payment.yappy[0].name})</span></p>
                <p className="text-gray-500 text-xs">o tambien a:</p>
                <p className="font-mono text-cyan-400 text-lg">{BUSINESS.payment.yappy[1].number} <span className="text-gray-500 text-sm">({BUSINESS.payment.yappy[1].name})</span></p>
              </div>
              <p className="text-gray-500 text-xs">En la descripcion del Yappy pon: <span className="text-white">{orderNumber}</span></p>
            </div>
          </div>

          {/* ACH */}
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏦</span>
              <h4 className="font-bold">ACH / Transferencia Bancaria</h4>
            </div>
            <div className="text-sm space-y-2">
              <p className="text-gray-300">Transfiere <span className="text-white font-bold">${product.price.toFixed(2)}</span> a:</p>
              <div className="bg-black/30 rounded-lg p-3 space-y-1 text-sm">
                <p><span className="text-gray-500">Banco:</span> <span className="text-cyan-400">{BUSINESS.payment.ach.bank}</span></p>
                <p><span className="text-gray-500">Tipo:</span> <span className="text-cyan-400">{BUSINESS.payment.ach.type}</span></p>
                <p><span className="text-gray-500">Titular:</span> <span className="text-cyan-400">{BUSINESS.payment.ach.holder}</span></p>
                <p><span className="text-gray-500">Cuenta:</span> <span className="text-cyan-400 font-mono">{BUSINESS.payment.ach.account}</span></p>
              </div>
              <p className="text-gray-500 text-xs">En la referencia pon: <span className="text-white">{orderNumber}</span></p>
            </div>
          </div>
        </div>

        {/* Confirm Payment */}
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">Paso Final: Confirma tu pago</h3>
          <p className="text-sm text-gray-400 mb-4">
            Despues de pagar, envianos el comprobante por WhatsApp para procesar tu {isSoftware ? "clave inmediatamente" : "envio"}.
          </p>
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            Enviar Comprobante por WhatsApp
          </a>
        </div>

        {/* Invoice link */}
        <div className="text-center">
          <Link
            href={`/synovatech/factura?id=${product.id}&order=${orderNumber}`}
            className="text-sm text-cyan-400 hover:underline"
          >
            Ver factura de esta compra →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
