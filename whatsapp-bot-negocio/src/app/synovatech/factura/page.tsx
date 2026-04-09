"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getProduct, BUSINESS } from "@/lib/synovatech-data";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const orderNumber = searchParams.get("order") || `ST-${Date.now().toString().slice(-6)}`;
  const product = productId ? getProduct(productId) : null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Factura no encontrada</p>
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Print button */}
        <div className="text-center mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
          >
            Imprimir / Guardar PDF
          </button>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-xl shadow-lg p-8 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">ST</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SynovaTech PTY</h1>
                  <p className="text-xs text-gray-500">Soluciones Tecnologicas Integrales</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                <p>{BUSINESS.email}</p>
                <p>WhatsApp: {BUSINESS.whatsappDisplay}</p>
                <p>Panama</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900">FACTURA</h2>
              <p className="text-sm text-gray-500 mt-1">#{orderNumber}</p>
              <p className="text-sm text-gray-500">{dateStr}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-gray-500 font-medium">Producto</th>
                  <th className="text-center py-3 text-gray-500 font-medium">Cant.</th>
                  <th className="text-right py-3 text-gray-500 font-medium">Precio</th>
                  <th className="text-right py-3 text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.subcategory} {product.type ? `- ${product.type}` : ""}</p>
                  </td>
                  <td className="py-4 text-center text-gray-700">1</td>
                  <td className="py-4 text-right text-gray-700">${product.price.toFixed(2)}</td>
                  <td className="py-4 text-right text-gray-900 font-medium">${product.price.toFixed(2)}</td>
                </tr>
                {product.category === "mesa" && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3">
                      <p className="text-gray-700">Envio a todo Panama (Red Servi)</p>
                    </td>
                    <td className="py-3 text-center text-gray-700">1</td>
                    <td className="py-3 text-right text-gray-700">$0.00</td>
                    <td className="py-3 text-right text-green-600 font-medium">GRATIS</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>ITBMS (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 mt-3 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>${product.price.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-8 bg-gray-50 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Informacion de Pago</h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <p className="font-medium text-gray-800">Yappy</p>
                <p>{BUSINESS.payment.yappy[0].number} ({BUSINESS.payment.yappy[0].name})</p>
                <p>{BUSINESS.payment.yappy[1].number} ({BUSINESS.payment.yappy[1].name})</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">ACH / Transferencia</p>
                <p>{BUSINESS.payment.ach.bank} - {BUSINESS.payment.ach.type}</p>
                <p>{BUSINESS.payment.ach.holder}</p>
                <p>Cuenta: {BUSINESS.payment.ach.account}</p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="mt-4 bg-cyan-50 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Entrega</h3>
            <p className="text-xs text-gray-600">{product.delivery}</p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
            <p>Gracias por tu compra - {BUSINESS.fullName}</p>
            <p className="mt-1">{BUSINESS.instagram} | {BUSINESS.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FacturaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando factura...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
